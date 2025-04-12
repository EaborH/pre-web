<script setup>
import { onMounted, ref} from 'vue'
import { queryPageApi , addApi, queryInfoApi, updateApi, deleteApi} from '@/api/ward'
import { queryAllApi as queryAllEmpApi } from '@/api/emp'
import { ElMessage, ElMessageBox } from 'element-plus'

//搜索表单对象
let searchWard = ref({name:''})
//列表展示数据
let tableData = ref([])

//钩子函数 - 页面加载时触发
onMounted(() => {
  queryPage()
  queryAllEmp()
})

//所有的员工数据
let emps = ref([])

//加载所有的员工数据
const queryAllEmp = async () => {
  let result = await queryAllEmpApi()
  if(result.code) {
    emps.value = result.data
  }
}

//分页组件
const pagination = ref({currentPage: 1, pageSize: 10, total: 0})

//每页展示记录数发生变化时触发
const handleSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  queryPage()
}
//当前页码发生变化时触发
const handleCurrentChange = (page) => {
  pagination.value.currentPage = page
  queryPage()
}

//分页条件查询
const queryPage = async () => {
  const result = await queryPageApi(
      searchWard.value.name,
      pagination.value.currentPage,
      pagination.value.pageSize
  );

  if(result.code) {
    tableData.value = result.data.rows
    pagination.value.total = result.data.total
  }
}

//清空搜索栏
const clear = () => {
  searchWard.value = {name:''}
  queryPage()
}


//----------- 新增 / 修改 ---------------------------
let dialogFormVisible = ref(false) //控制新增/修改的对话框的显示与隐藏
let labelWidth = ref(80) //form表单label的宽度
let formTitle = ref('') //表单的标题
//员工对象-表单数据绑定
let ward = ref({
  id: '',
  name: '',
  room: '',
  masterId: '',
  deptId: ''
})

//清空表单
const clearWard = () => {
  ward.value = {
    id: '',
    name: '',
    room: '',
    masterId: '',
    deptId: ''
  }
}

//新增病房
const addWard = () => {
  dialogFormVisible.value = true
  formTitle.value = '新增病房'
  clearWard()
}

//修改病房
const updateWard = async (id) => {
  clearWard()
  dialogFormVisible.value = true
  formTitle.value = '修改病房'
  let result = await queryInfoApi(id)
  if(result.code){
    ward.value = result.data
  }
}

//表单校验规则
const wardFormRef = ref()
const rules = ref({
  name: [
    { required: true, message: '病房名称为必填项', trigger: 'blur' },
    { min: 4, max: 30, message: '用户名长度为4-30个字', trigger: 'blur' }
  ],
  room: [
    { min: 1, max: 20, message: '病房长度为1-20个字', trigger: 'blur' }
  ],
})

//重置表单
const resetForm = (wardForm) => {
  if (!wardForm) return
  wardForm.resetFields()
}

//-------------保存病房信息 
const save = (wardForm) => {
  console.log('wardForm: ' + ward);
  // debugger;
  //表单校验
  if(!wardForm) return
  wardForm.validate(async (valid) => {
    if(valid) {
      let api 
      if(ward.value.id) {
        api = updateApi(ward.value)
      }else {
        api = addApi(ward.value)
      }

      let result = await api
      if(result.code) {
        ElMessage.success('操作成功')
        dialogFormVisible.value = false
        queryPage()
      }else {
        ElMessage.error(result.msg)
      }
    }else {
      console.log('valid: '+ valid);
      
      return false
    }
  })
}

//------- 删除病房
//根据ID删除单个病房
const delById = async (id) => {
  ElMessageBox.confirm('您确认删除此数据吗?' , '删除病房', {confirmButtonText:'确认', cancelButtonText:'取消',type:'warning'})
    .then(async () => {
      let result =  await deleteApi(id)
      if(result.code) {
        ElMessage.success('删除成功')
        queryPage()
      }else {
        ElMessage.error(result.msg)
      }
    }).catch(() => {
      ElMessage.info('取消删除')
    })
}
</script>

<template>

  <!-- 顶部标题 -->
  <div>
    <div id="title">病房管理</div><br>
  </div>

  <!-- 条件搜索表单 -->
  <el-form :inline="true" :model="searchWard" class="demo-form-inline">
    <el-form-item label="病房名称">
      <el-input v-model="searchWard.name" placeholder="请输入病房名称"/>
    </el-form-item>
    

    <el-form-item>
      <el-button type="primary" @click="queryPage()">查询</el-button>
      <el-button type="info" @click="clear()">清空</el-button>
    </el-form-item>
  </el-form>
  
  <!-- 功能按钮 -->
  <el-button type="success" @click="addWard();resetForm(wardFormRef)">+ 新增病房</el-button>
  <br><br>
  
  <!-- 列表展示 -->
  <el-table :data="tableData" border style="width: 100%" fit>
    <el-table-column type="index" label="编号" width="55" align="center"/>
    <el-table-column prop="name" label="病房名称" align="center" width="200px" />
    <el-table-column prop="room" label="病房号" align="center" width="200px"/>
    <el-table-column prop="masterName" label="主管医生" align="center" width="200px"/>
    <el-table-column prop="status" label="状态" align="center" width="130px" />
    <el-table-column prop="updateTime" label="最后修改时间" align="center" />
    <el-table-column label="操作" align="center">
      <template #default="scope">
        <el-button type="primary" size="small" @click="updateWard(scope.row.id); resetForm(wardFormRef)">编辑</el-button>
        <el-button type="danger" size="small" @click="delById(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  <br>

  <!-- 分页组件Pagination -->
  <el-pagination
    v-model:current-page="pagination.currentPage"
    v-model:page-size="pagination.pageSize"
    :page-sizes="[5, 10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next, jumper"
    :total="pagination.total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />




<!-- 新增/修改员工对话框 -->
<el-dialog v-model="dialogFormVisible" :title="formTitle" width="35%">
  <el-form :model="ward" ref="wardFormRef" :rules="rules">
    <el-form-item label="病房名称" :label-width="labelWidth" prop="name">
      <el-input v-model="ward.name" placeholder="请输入病房名称" />
    </el-form-item>

    <el-form-item label="病房号" :label-width="labelWidth" prop="room">
      <el-input v-model="ward.room" placeholder="请输入病房号"/>
    </el-form-item>
  
    <el-form-item label="主管医生" :label-width="labelWidth">
      <el-select v-model="ward.masterId" placeholder="请选择主管医生" style="width: 100%;">
        <el-option v-for="emp in emps" :label="emp.name" :value="emp.id" />
      </el-select>
    </el-form-item>

  </el-form>

  <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogFormVisible = false; resetForm(wardFormRef)">取消</el-button>
      <el-button type="primary" @click="save(wardFormRef)">保存</el-button>
    </span>
  </template>
</el-dialog>

</template>


<style scoped>
#title {
font-size: 20px;
font-weight: 600;
}
</style>

