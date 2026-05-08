const express = require('express')
const controller = require('../controllers/goodSitesController')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/', controller.getGoodSites)
router.get('/categories', controller.getGoodSiteCategories)
router.post('/categories/primary', requireAuth, controller.createPrimaryCategory)
router.post('/categories/secondary', requireAuth, controller.createSecondaryCategory)
router.delete('/categories/primary/:id', requireAuth, controller.deletePrimaryCategory)
router.delete('/categories/secondary/:id', requireAuth, controller.deleteSecondaryCategory)
router.put('/category-order', requireAuth, controller.updateCategoryOrder)
router.post('/', requireAuth, controller.createGoodSite)
router.put('/:id', requireAuth, controller.updateGoodSite)
router.delete('/:id', requireAuth, controller.deleteGoodSite)

module.exports = router
