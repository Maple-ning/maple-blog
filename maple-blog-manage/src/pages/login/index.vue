<template>
  <div class="login">
    <div class="content">
      <div class="title">枫叶世界</div>
      <el-form :model="form" size="large" :rules="rules" ref="login">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            @keyup.enter="onSubmit(login)"
          >
            <template #prefix>
              <el-icon class="el-input__icon"><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            @keyup.enter="onSubmit(login)"
          >
            <template #prefix>
              <el-icon class="el-input__icon"><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            round
            style="width: 100%"
            @click="onSubmit(login)"
            >进入世界</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";

interface LoginInfo {
  username: string;
  password: string;
}

const router = useRouter();
const form = reactive<LoginInfo>({
  username: "",
  password: "",
});

const rules: FormRules = {
  username: [
    {
      required: true,
      message: "请输入用户名",
      trigger: "blur",
    },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const login = ref<FormInstance>();
const onSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success("登录成功");
      localStorage.setItem("username", form.username);
      router.push("/");
    } else {
      ElMessage.error("登录失败");
      return false;
    }
  });
};
</script>

<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100%;
  background-image: url(@/assets/img/future.jpg);
  background-size: 100% 100%;
  position: relative;
  .content {
    position: absolute;
    box-sizing: border-box;
    left: 20%;
    top: 50%;
    transform: translateY(-50%);
    width: 400px;
    height: 700px;
    padding: 100px 24px;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    background: #fff;
  }
  .title {
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    padding: 16px 0;
    margin-bottom: 60px;
  }
  .el-form-item {
    margin-bottom: 40px;
  }
}
</style>
