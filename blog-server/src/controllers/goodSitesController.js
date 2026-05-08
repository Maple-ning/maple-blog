const pool = require('../config/db')

const DEFAULT_PRIMARY_CATEGORY = '精选友链'
const DEFAULT_SECONDARY_CATEGORY = '未分类'

const asRowArray = (rows) => (Array.isArray(rows) ? rows : [])

const normalizeText = (value, fallback = '') => {
  const text = String(value ?? '').trim()
  return text || fallback
}

const toPlainGoodSiteRow = (r) => ({
  id: Number(r.id),
  title: r.title == null ? '' : String(r.title),
  url: r.url == null ? '' : String(r.url),
  description: r.description == null ? '' : String(r.description),
  primary_category: r.primary_category == null ? '' : String(r.primary_category),
  secondary_category: r.secondary_category == null ? '' : String(r.secondary_category),
  category: r.category == null ? '' : String(r.category),
  sort_order: Number(r.sort_order) || 0,
  created_at: r.created_at == null ? null : String(r.created_at),
  updated_at: r.updated_at == null ? null : String(r.updated_at),
})

const toPlainPrimaryCategory = (row) => ({
  id: Number(row.id),
  key: normalizeText(row.category_key),
  label: normalizeText(row.category_label),
  sort_order: Number(row.sort_order) || 0,
})

const toPlainSecondaryCategory = (row) => ({
  id: Number(row.id),
  primary_category_id: Number(row.primary_category_id),
  key: normalizeText(row.category_key),
  label: normalizeText(row.category_label),
  sort_order: Number(row.sort_order) || 0,
})

const buildCategoryTree = (primaryRows, secondaryRows) => {
  const secondaryMap = new Map()

  for (const secondary of secondaryRows) {
    const list = secondaryMap.get(secondary.primary_category_id) ?? []
    list.push({
      id: secondary.id,
      key: secondary.key,
      label: secondary.label,
      sortOrder: secondary.sort_order,
    })
    secondaryMap.set(secondary.primary_category_id, list)
  }

  return primaryRows.map((primary) => ({
    id: primary.id,
    key: primary.key,
    label: primary.label,
    sortOrder: primary.sort_order,
    children: (secondaryMap.get(primary.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, 'zh-CN')),
  }))
}

const getCategoryConfig = async (connection = pool) => {
  const [primaryRowsRaw] = await connection.query(
    'SELECT id, category_key, category_label, sort_order FROM good_site_primary_categories ORDER BY sort_order ASC, id ASC',
  )
  const [secondaryRowsRaw] = await connection.query(
    'SELECT id, primary_category_id, category_key, category_label, sort_order FROM good_site_secondary_categories ORDER BY sort_order ASC, id ASC',
  )
  const primaryRows = asRowArray(primaryRowsRaw).map(toPlainPrimaryCategory)
  const secondaryRows = asRowArray(secondaryRowsRaw).map(toPlainSecondaryCategory)

  return {
    primaryRows,
    secondaryRows,
    categoryTree: buildCategoryTree(primaryRows, secondaryRows),
  }
}

const getCategoryLookup = async (connection = pool) => {
  const { primaryRows, secondaryRows } = await getCategoryConfig(connection)
  const primaryByLabel = new Map(primaryRows.map((item) => [item.label, item]))
  const primaryById = new Map(primaryRows.map((item) => [item.id, item]))
  const secondaryByLabel = new Map(
    secondaryRows.map((item) => [`${item.primary_category_id}::${item.label}`, item]),
  )
  const secondaryById = new Map(secondaryRows.map((item) => [item.id, item]))

  return {
    primaryRows,
    secondaryRows,
    primaryByLabel,
    primaryById,
    secondaryByLabel,
    secondaryById,
  }
}

const ensureDefaultCategories = async () => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [primaryResult] = await conn.query(
      `INSERT INTO good_site_primary_categories (category_key, category_label, sort_order)
       VALUES (?, ?, 0)
       ON DUPLICATE KEY UPDATE category_label = VALUES(category_label)`,
      [DEFAULT_PRIMARY_CATEGORY, DEFAULT_PRIMARY_CATEGORY],
    )

    const [[primaryRow]] = await conn.query(
      'SELECT id FROM good_site_primary_categories WHERE category_key = ? LIMIT 1',
      [DEFAULT_PRIMARY_CATEGORY],
    )
    const primaryId = Number(primaryRow?.id || 0)

    if (primaryId > 0) {
      await conn.query(
        `INSERT INTO good_site_secondary_categories (primary_category_id, category_key, category_label, sort_order)
         VALUES (?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE category_label = VALUES(category_label), primary_category_id = VALUES(primary_category_id)`,
        [primaryId, DEFAULT_SECONDARY_CATEGORY, DEFAULT_SECONDARY_CATEGORY],
      )
    }

    await conn.commit()
    return primaryResult
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

const resolvePrimaryCategory = async (connection, primaryCategoryLabel) => {
  const resolvedLabel = normalizeText(primaryCategoryLabel, DEFAULT_PRIMARY_CATEGORY)
  const [[row]] = await connection.query(
    'SELECT id, category_label, category_key, sort_order FROM good_site_primary_categories WHERE category_label = ? LIMIT 1',
    [resolvedLabel],
  )
  if (!row) {
    throw new Error(`PRIMARY_CATEGORY_NOT_FOUND:${resolvedLabel}`)
  }
  return toPlainPrimaryCategory(row)
}

const resolveSecondaryCategory = async (connection, primaryCategoryId, secondaryCategoryLabel) => {
  const resolvedLabel = normalizeText(secondaryCategoryLabel, DEFAULT_SECONDARY_CATEGORY)
  const [[row]] = await connection.query(
    `SELECT id, primary_category_id, category_label, category_key, sort_order
     FROM good_site_secondary_categories
     WHERE primary_category_id = ? AND category_label = ?
     LIMIT 1`,
    [primaryCategoryId, resolvedLabel],
  )
  if (!row) {
    throw new Error(`SECONDARY_CATEGORY_NOT_FOUND:${resolvedLabel}`)
  }
  return toPlainSecondaryCategory(row)
}

const getGoodSites = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM good_sites ORDER BY sort_order ASC, id DESC',
    )
    const items = asRowArray(rows).map(toPlainGoodSiteRow)
    const { categoryTree } = await getCategoryConfig()
    res.json({ items, categoryTree })
  } catch (error) {
    res.status(500).json({ message: '获取好站失败', error: error.message })
  }
}

const getGoodSiteCategories = async (_req, res) => {
  try {
    const { categoryTree } = await getCategoryConfig()
    res.json({ items: categoryTree })
  } catch (error) {
    res.status(500).json({ message: '获取好站分类失败', error: error.message })
  }
}

const createPrimaryCategory = async (req, res) => {
  const label = normalizeText(req.body?.label)
  if (!label) {
    return res.status(400).json({ message: '一级分类名称不能为空' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [[maxRow]] = await conn.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS maxSortOrder FROM good_site_primary_categories',
    )
    const nextSortOrder = Number(maxRow?.maxSortOrder ?? -1) + 1

    const [result] = await conn.query(
      `INSERT INTO good_site_primary_categories (category_key, category_label, sort_order)
       VALUES (?, ?, ?)`,
      [label, label, nextSortOrder],
    )

    await conn.commit()
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    await conn.rollback()
    const message =
      error && String(error.code) === 'ER_DUP_ENTRY'
        ? '一级分类名称已存在'
        : '创建一级分类失败'
    res.status(message === '一级分类名称已存在' ? 409 : 500).json({ message, error: error.message })
  } finally {
    conn.release()
  }
}

const createSecondaryCategory = async (req, res) => {
  const primaryCategoryLabel = normalizeText(req.body?.primaryCategory)
  const label = normalizeText(req.body?.label)

  if (!primaryCategoryLabel || !label) {
    return res.status(400).json({ message: '一级分类和二级分类名称不能为空' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const primary = await resolvePrimaryCategory(conn, primaryCategoryLabel)
    const [[maxRow]] = await conn.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS maxSortOrder FROM good_site_secondary_categories WHERE primary_category_id = ?',
      [primary.id],
    )
    const nextSortOrder = Number(maxRow?.maxSortOrder ?? -1) + 1

    const [result] = await conn.query(
      `INSERT INTO good_site_secondary_categories (primary_category_id, category_key, category_label, sort_order)
       VALUES (?, ?, ?, ?)`,
      [primary.id, label, label, nextSortOrder],
    )

    await conn.commit()
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    await conn.rollback()
    const rawMessage = String(error.message || '')
    const isMissingPrimary = rawMessage.startsWith('PRIMARY_CATEGORY_NOT_FOUND:')
    const isDuplicate = String(error.code) === 'ER_DUP_ENTRY'
    const message = isMissingPrimary
      ? '所属一级分类不存在'
      : isDuplicate
        ? '该一级分类下已存在同名二级分类'
        : '创建二级分类失败'
    res.status(isMissingPrimary ? 404 : isDuplicate ? 409 : 500).json({ message, error: error.message })
  } finally {
    conn.release()
  }
}

const deletePrimaryCategory = async (req, res) => {
  const { id } = req.params
  const categoryId = Number(id)

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return res.status(400).json({ message: '一级分类 id 无效' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [[primaryRow]] = await conn.query(
      `SELECT id, category_label
       FROM good_site_primary_categories
       WHERE id = ?
       LIMIT 1`,
      [categoryId],
    )

    if (!primaryRow) {
      await conn.rollback()
      return res.status(404).json({ message: '一级分类不存在' })
    }

    const primaryLabel = normalizeText(primaryRow.category_label)
    const [secondaryRowsRaw] = await conn.query(
      `SELECT id, category_label
       FROM good_site_secondary_categories
       WHERE primary_category_id = ?`,
      [categoryId],
    )
    const secondaryRows = asRowArray(secondaryRowsRaw)
    const secondaryLabels = secondaryRows
      .map((item) => normalizeText(item.category_label))
      .filter((item) => item)

    let deletedSites = 0
    if (secondaryLabels.length > 0) {
      const placeholders = secondaryLabels.map(() => '?').join(', ')
      const deleteParams = [primaryLabel, ...secondaryLabels]
      const [siteResult] = await conn.query(
        `DELETE FROM good_sites
         WHERE primary_category = ? OR secondary_category IN (${placeholders})`,
        deleteParams,
      )
      deletedSites = Number(siteResult?.affectedRows ?? 0)
    } else {
      const [siteResult] = await conn.query(
        'DELETE FROM good_sites WHERE primary_category = ?',
        [primaryLabel],
      )
      deletedSites = Number(siteResult?.affectedRows ?? 0)
    }

    await conn.query(
      'DELETE FROM good_site_secondary_categories WHERE primary_category_id = ?',
      [categoryId],
    )
    await conn.query('DELETE FROM good_site_primary_categories WHERE id = ?', [categoryId])

    await conn.commit()
    res.json({
      message: `一级分类已删除，并同步删除二级分类 ${secondaryRows.length} 个、友链站点 ${deletedSites} 条`,
    })
  } catch (error) {
    await conn.rollback()
    res.status(500).json({ message: '删除一级分类失败', error: error.message })
  } finally {
    conn.release()
  }
}

const deleteSecondaryCategory = async (req, res) => {
  const { id } = req.params
  const categoryId = Number(id)

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return res.status(400).json({ message: '二级分类 id 无效' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [[secondaryRow]] = await conn.query(
      `SELECT id, primary_category_id, category_label
       FROM good_site_secondary_categories
       WHERE id = ?
       LIMIT 1`,
      [categoryId],
    )
    if (!secondaryRow) {
      await conn.rollback()
      return res.status(404).json({ message: '二级分类不存在' })
    }

    const secondaryLabel = normalizeText(secondaryRow.category_label)
    const [[siteCountRow]] = await conn.query(
      'SELECT COUNT(*) AS total FROM good_sites WHERE secondary_category = ?',
      [secondaryLabel],
    )
    const total = Number(siteCountRow?.total ?? 0)

    await conn.query('DELETE FROM good_sites WHERE secondary_category = ?', [secondaryLabel])

    await conn.query('DELETE FROM good_site_secondary_categories WHERE id = ?', [categoryId])
    await conn.commit()
    res.json({ message: `二级分类已删除，并同步删除关联站点 ${total} 条` })
  } catch (error) {
    await conn.rollback()
    res.status(500).json({ message: '删除二级分类失败', error: error.message })
  } finally {
    conn.release()
  }
}

const updateCategoryOrder = async (req, res) => {
  const { primaryOrder, secondaryOrder } = req.body
  if (!Array.isArray(primaryOrder) || !Array.isArray(secondaryOrder)) {
    return res.status(400).json({ message: 'primaryOrder 和 secondaryOrder 必须为数组' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    let primaryIndex = 0
    for (const raw of primaryOrder) {
      const label = normalizeText(raw)
      if (!label) continue
      await conn.query(
        'UPDATE good_site_primary_categories SET sort_order = ? WHERE category_label = ?',
        [primaryIndex, label],
      )
      primaryIndex += 1
    }

    for (const item of secondaryOrder) {
      if (!item || typeof item !== 'object') continue
      const primaryCategory = normalizeText(item.primaryCategory)
      const order = Array.isArray(item.order) ? item.order : []
      if (!primaryCategory) continue
      const primary = await resolvePrimaryCategory(conn, primaryCategory)
      let secondaryIndex = 0
      for (const raw of order) {
        const label = normalizeText(raw)
        if (!label) continue
        await conn.query(
          `UPDATE good_site_secondary_categories
           SET sort_order = ?
           WHERE primary_category_id = ? AND category_label = ?`,
          [secondaryIndex, primary.id, label],
        )
        secondaryIndex += 1
      }
    }

    await conn.commit()
    res.json({ message: '分类顺序已保存' })
  } catch (error) {
    await conn.rollback()
    res.status(500).json({ message: '保存分类顺序失败', error: error.message })
  } finally {
    conn.release()
  }
}

const createGoodSite = async (req, res) => {
  const {
    title,
    url,
    description = '',
    primaryCategory,
    secondaryCategory,
    category,
    sortOrder = 0,
  } = req.body
  const normalizedTitle = normalizeText(title)
  const normalizedUrl = normalizeText(url)
  const resolvedPrimaryCategory = normalizeText(primaryCategory, DEFAULT_PRIMARY_CATEGORY)
  const resolvedSecondaryCategory = normalizeText(secondaryCategory || category, DEFAULT_SECONDARY_CATEGORY)

  if (!normalizedTitle || !normalizedUrl || !resolvedPrimaryCategory || !resolvedSecondaryCategory) {
    return res.status(400).json({ message: '标题、链接、一级分类和二级分类为必填' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const primary = await resolvePrimaryCategory(conn, resolvedPrimaryCategory)
    const secondary = await resolveSecondaryCategory(conn, primary.id, resolvedSecondaryCategory)
    const [result] = await conn.query(
      'INSERT INTO good_sites (title, url, description, primary_category, secondary_category, category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        normalizedTitle,
        normalizedUrl,
        description,
        primary.label,
        secondary.label,
        secondary.label,
        Number(sortOrder) || 0,
      ],
    )
    await conn.commit()
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    await conn.rollback()
    const rawMessage = String(error.message || '')
    const message = rawMessage.startsWith('PRIMARY_CATEGORY_NOT_FOUND:')
      ? '所选一级分类不存在'
      : rawMessage.startsWith('SECONDARY_CATEGORY_NOT_FOUND:')
        ? '所选二级分类不存在'
        : '创建好站失败'
    res.status(rawMessage.includes('_NOT_FOUND:') ? 404 : 500).json({ message, error: error.message })
  } finally {
    conn.release()
  }
}

const updateGoodSite = async (req, res) => {
  const { id } = req.params
  const {
    title,
    url,
    description = '',
    primaryCategory,
    secondaryCategory,
    category,
    sortOrder = 0,
  } = req.body
  const normalizedTitle = normalizeText(title)
  const normalizedUrl = normalizeText(url)
  const resolvedPrimaryCategory = normalizeText(primaryCategory, DEFAULT_PRIMARY_CATEGORY)
  const resolvedSecondaryCategory = normalizeText(secondaryCategory || category, DEFAULT_SECONDARY_CATEGORY)

  if (!normalizedTitle || !normalizedUrl || !resolvedPrimaryCategory || !resolvedSecondaryCategory) {
    return res.status(400).json({ message: '标题、链接、一级分类和二级分类为必填' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const primary = await resolvePrimaryCategory(conn, resolvedPrimaryCategory)
    const secondary = await resolveSecondaryCategory(conn, primary.id, resolvedSecondaryCategory)
    const [result] = await conn.query(
      'UPDATE good_sites SET title = ?, url = ?, description = ?, primary_category = ?, secondary_category = ?, category = ?, sort_order = ? WHERE id = ?',
      [
        normalizedTitle,
        normalizedUrl,
        description,
        primary.label,
        secondary.label,
        secondary.label,
        Number(sortOrder) || 0,
        Number(id),
      ],
    )
    if (result.affectedRows === 0) {
      await conn.rollback()
      return res.status(404).json({ message: '记录不存在' })
    }
    await conn.commit()
    res.json({ message: '更新成功' })
  } catch (error) {
    await conn.rollback()
    const rawMessage = String(error.message || '')
    const message = rawMessage.startsWith('PRIMARY_CATEGORY_NOT_FOUND:')
      ? '所选一级分类不存在'
      : rawMessage.startsWith('SECONDARY_CATEGORY_NOT_FOUND:')
        ? '所选二级分类不存在'
        : '更新好站失败'
    res.status(rawMessage.includes('_NOT_FOUND:') ? 404 : 500).json({ message, error: error.message })
  } finally {
    conn.release()
  }
}

const deleteGoodSite = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM good_sites WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ message: '记录不存在' })
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ message: '删除好站失败', error: error.message })
  }
}

module.exports = {
  getGoodSites,
  getGoodSiteCategories,
  createPrimaryCategory,
  createSecondaryCategory,
  deletePrimaryCategory,
  deleteSecondaryCategory,
  updateCategoryOrder,
  createGoodSite,
  updateGoodSite,
  deleteGoodSite,
}
