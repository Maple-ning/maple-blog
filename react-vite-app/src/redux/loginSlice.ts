import { createSlice } from "@reduxjs/toolkit";

export const loginSlice = createSlice({
  name: "login",
  initialState: {
    value:0
  },
  reducers: {
    increment: state => {
      state.value += 1;
    }
  },
});

export const { increment } = loginSlice.actions;

export default loginSlice.reducer;