import request from '@/utils/request'

//分页条件查询
export const queryPageApi = (wardId, name, page, pageSize) => 
  request.get(`/pts?wardId=${wardId}&name=${name}&page=${page}&pageSize=${pageSize}`)

//新增学生
export const addApi = (pts) => request.post('/pts', pts)

//根据ID查询学生
export const queryInfoApi = (id) => request.get(`/pts/${id}`)

//修改学生
export const updateApi = (pts) => request.put(`/pts`, pts)

//删除学生
export const deleteApi = (ids) => request.delete(`/pts/${ids}`)

