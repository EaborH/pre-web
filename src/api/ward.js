import request from '@/utils/request'

//分页条件查询
export const queryPageApi = (name, page, pageSize) => 
  request.get(`/wards?name=${name}&page=${page}&pageSize=${pageSize}`)

//新增病房
export const addApi = (ward) => request.post('/wards', ward)

//根据ID查询病房
export const queryInfoApi = (id) => request.get(`/wards/${id}`)

//更新病房
export const updateApi = (ward) => request.put(`/wards`, ward)

//删除病房
export const deleteApi = (id) => request.delete(`/wards/${id}`)

//查询全部病房信息
export const queryAllApi = () => request.get('/wards/list')
