<template>
  <header>
    <div class="header-bar">
      <div class="item-logo">
        <img src="/maple.svg" />
        枫叶之家
      </div>
      <div class="header-right">
        <el-avatar
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
        <div class="username">admin</div>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item command="loginout" divided
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowDown } from "@element-plus/icons-vue";

// 用户名下拉菜单选择事件
const router = useRouter();
const handleCommand = (command: string) => {
	if (command == 'loginout') {
		localStorage.removeItem('ms_username');
		router.push('/login');
	} else if (command == 'user') {
		router.push('/user');
	}
};
</script>

<style lang="scss" scoped>
.header-bar {
  height: 100%;
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-logo {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
  color: #d3b17d;
  font-size: 20px;
  font-weight: 600;
  > img {
    width: 50px;
    margin-right: 8px;
  }
}
.header-right {
  display: flex;
  .username {
    margin: 0 8px;
    display: flex;
    align-items: center;
  }
  .el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
  }
}
</style>
