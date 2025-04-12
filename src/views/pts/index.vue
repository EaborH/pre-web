<script setup>
import { onMounted, ref } from 'vue'
import { queryPageApi , addApi, queryInfoApi, updateApi, deleteApi} from '@/api/pts'
import { queryAllApi as queryAllWardApi } from '@/api/ward'
import { ElMessage, ElMessageBox } from 'element-plus'

//性别列表数据
const genders = ref([{ name: '男', value: 1 }, { name: '女', value: 2 }])

//搜索表单对象
let searchPts = ref({wardId: '',name: ''}) 

//列表展示数据
let tableData = ref([])

//钩子函数 - 页面加载时触发
onMounted(() => {
  queryPage()
  queryAllWard()
})

//所有的病房数据
let wards = ref([])

//加载所有的病房数据
const queryAllWard = async () => {
  let result = await queryAllWardApi()
  if(result.code) {
    wards.value = result.data
  }
}

//复选框
let selectIds = ref([])
const handleSelectionChange = (selection) => {
  selectIds.value = selection.map(item => item.id)
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
      searchPts.value.wardId,
      searchPts.value.name,
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
  searchPts.value = {wardId:'', name:'',}
  queryPage()
}

//----------- 新增 / 修改 ---------------------------
let dialogFormVisible = ref(false) //控制新增/修改的对话框的显示与隐藏
let labelWidth = ref(100) //form表单label的宽度
let formTitle = ref('') //表单的标题
let pts = ref({ //病人对象-表单数据绑定
  name: '',
  num: '',
  gender: '',
  wardId: ''
})
//清空表单
const clearPts = () => {
  pts.value = {
    name: '',
    num: '',
    gender: '',
    wardId: ''
  }
}
//新增病人
const addPts = () => {
  dialogFormVisible.value = true
  formTitle.value = '新增病人'
  clearPts()
}

//修改病人
const updatePts = async (id) => {
  clearPts()
  dialogFormVisible.value = true
  formTitle.value = '修改病人'
  let result = await queryInfoApi(id)
  if(result.code){
    pts.value = result.data
  }
}

//表单校验规则
const ptsFormRef = ref()
const rules = ref({
  name: [
    { required: true, message: '姓名为必填项', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度为2-20个字', trigger: 'blur' }
  ],
  num: [
    { required: true, message: 'ID为必填项', trigger: 'blur' },
    { min: 10, max: 10, message: 'ID长度为10个字', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '性别为必填项', trigger: 'change' }],
})

//重置表单
const resetForm = (ptsForm) => {
  if (!ptsForm) return
  ptsForm.resetFields()
}

//-------------保存病人信息 
const save = (ptsForm) => {
  //表单校验
  if(!ptsForm) return
  ptsForm.validate(async (valid) => {
    if(valid) {
      let api 
      if(pts.value.id) {
        api = updateApi(pts.value)
      }else {
        api = addApi(pts.value)
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
      return false
    }
  })
}

//------- 删除病人
//根据ID删除单个病人
const delById = async (id) => {
  ElMessageBox.confirm('您确认删除此数据吗?' , '删除病人', {confirmButtonText:'确认', cancelButtonText:'取消', type:'warning'})
    .then(async () => {
      let result =  await deleteApi(`${id}`)
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

//批量删除病人
const delByIds = async () => {
  ElMessageBox.confirm('您确认删除此数据吗?' , '删除病人', {confirmButtonText:'确认', cancelButtonText:'取消',type:'warning'})
    .then(async () => {
      let result =  await deleteApi(selectIds.value.join(','))
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
    <div id="title">病人管理</div><br>
  </div>

  <!-- 条件搜索表单 -->
  <el-form :inline="true" :model="searchPts" class="demo-form-inline">
    <el-form-item label="姓名">
      <el-input v-model="searchPts.name" placeholder="请输入病人姓名"/>
    </el-form-item>

    <!-- <el-form-item label="所属病房">
      <el-select v-model="searchPts.wardId" placeholder="请选择">
        <el-option v-for="ward in wards" :label="ward.name" :value="ward.id" />
      </el-select>
    </el-form-item> -->

    <el-form-item>
      <el-button type="primary" @click="queryPage()">查询</el-button>
      <el-button type="info" @click="clear()">清空</el-button>
    </el-form-item>
  </el-form>
  
  <!-- 功能按钮 -->
  <el-button type="success" @click="addPts();resetForm(ptsFormRef)">+ 新增病人</el-button>
  <el-button type="danger" @click="delByIds()">- 批量删除</el-button>
  <br><br>
  
  
  <!-- 列表展示 -->
  <el-table :data="tableData" border style="width: 100%" fit @selection-change="handleSelectionChange">
    <el-table-column type="selection"  align="center" width="35" />
    <el-table-column prop="name" label="姓名" align="center" width="200px" />
    <el-table-column prop="num" label="ID" align="center" width="200px" />
    <!-- <el-table-column prop="wardName" label="所属病房" align="center" width="200px"/> -->
    <el-table-column prop="gender" label="性别" align="center" width="100px" >
      <template #default="scope">
        {{ scope.row.gender == 1 ? '男': '女' }}
      </template>
    </el-table-column>
    <el-table-column prop="updateTime" label="最后修改时间" align="center" width="300px"/>
    <el-table-column label="操作" align="center">
      <template #default="scope">
        <el-button type="primary" size="small" @click="updatePts(scope.row.id) ;resetForm(ptsFormRef)">编辑</el-button>
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




<!-- 新增/修改学员对话框 -->
<el-dialog v-model="dialogFormVisible" :title="formTitle" width="50%">
  <el-form :model="pts" ref="ptsFormRef" :rules="rules">
    <!-- 第一行 -->
    <el-row>
      <el-col :span="12">
        <el-form-item label="姓名" :label-width="labelWidth" prop="name">
          <el-input v-model="pts.name" placeholder="请输入病人姓名"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="ID" :label-width="labelWidth" prop="num">
          <el-input v-model="pts.num" placeholder="请输入病人ID"/>
        </el-form-item>
      </el-col>
    </el-row>
    
    <!-- 第二行 -->
    <el-row>
      <el-col :span="12">
        <el-form-item label="性别" :label-width="labelWidth"  prop="gender">
          <el-select v-model="pts.gender" placeholder="请选择" style="width: 100%;">
            <el-option v-for="gender in genders" :label="gender.name" :value="gender.value" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>


    <!-- 第五行 -->
    <el-row>
      <el-col :span="12">
        <el-form-item label="所属病房" :label-width="labelWidth">
          <el-select v-model="pts.wardId" placeholder="请选择" style="width: 100%;">
            <el-option v-for="ward in wards" :label="ward.name" :value="ward.id" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>

  <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogFormVisible = false; resetForm(ptsFormRef)">取消</el-button>
      <el-button type="primary" @click="save(ptsFormRef)">保存</el-button>
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