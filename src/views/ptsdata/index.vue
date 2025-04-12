<template>
  <div>
    <h2>病人数据</h2>
    
    <!-- 文件选择区域 -->
    <div class="file-selector">
      <button @click="loadLocalFile" class="load-btn">加载本地Excel文件</button>
      <button v-if="workbooks.length > 0" @click="clearData" class="clear-btn">清除数据</button>
      <div v-if="loading" class="loading">加载中...</div>
    </div>
    
    <!-- 工作表选择器 -->
    <div v-if="workbooks.length > 0" class="workbook-selector">
      <label for="workbook-select">选择工作表：</label>
      <select id="workbook-select" v-model="currentWorkbookIndex">
        <option v-for="(workbook, index) in workbooks" :key="index" :value="index">
          {{ workbook.name }}
        </option>
      </select>
    </div>
    
    <!-- 数据显示区域 -->
    <div v-if="workbooks.length > 0 && !loading" class="excel-container">
      <h3>{{ fileName }}</h3>
      <div v-if="currentWorkbook.data.length > 0">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in paginatedData" :key="index">
                <td v-for="(header, hIndex) in headers" :key="hIndex">
                  {{ row[header] !== undefined ? row[header] : '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 分页控制区域 -->
        <div class="pagination-container">
          <div class="data-info">
            共 {{ totalItems }} 条数据，当前显示第 {{ startItemIndex }} 至 {{ endItemIndex }} 条
          </div>
          
          <div class="page-size-selector">
            <label for="pageSize">每页显示：</label>
            <select id="pageSize" v-model="pageSize">
              <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
            </select>
          </div>
          
          <div class="pagination-controls">
            <button @click="goToFirstPage" :disabled="currentPage === 1">首页</button>
            <button @click="goToPrevPage" :disabled="currentPage === 1">上一页</button>
            
            <div class="page-numbers">
              <button 
                v-for="page in displayedPageNumbers" 
                :key="page" 
                @click="goToPage(page)" 
                :class="{ active: currentPage === page }"
              >
                {{ page }}
              </button>
            </div>
            
            <button @click="goToNextPage" :disabled="currentPage === totalPages">下一页</button>
            <button @click="goToLastPage" :disabled="currentPage === totalPages">末页</button>
          </div>
          
          <div class="jump-to-page">
            <label for="jumpInput">跳转到：</label>
            <input id="jumpInput" type="number" v-model="jumpToPage" min="1" :max="totalPages">
            <button @click="handleJumpToPage" :disabled="!isValidJumpPage">跳转</button>
          </div>
        </div>
      </div>
      <div v-else class="no-data">当前工作表没有数据</div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';

// 设置本地Excel文件路径
const LOCAL_EXCEL_FILE = '/public/data.xlsx'; // 替换为实际的文件路径

export default {
  name: 'ExcelRenderer',
  data() {
    return {
      fileName: '本地Excel文件',
      loading: false,
      workbooks: [], // 存储所有工作表的数据
      currentWorkbookIndex: 0, // 当前显示的工作表索引
      currentPage: 1,
      pageSize: 10,
      pageSizeOptions: [5, 10, 20, 50, 100],
      jumpToPage: 1
    };
  },
  computed: {
    // 获取当前选中的工作表
    currentWorkbook() {
      return this.workbooks[this.currentWorkbookIndex] || { data: [], headers: [] };
    },
    // 获取当前工作表的数据
    excelData() {
      return this.currentWorkbook.data || [];
    },
    // 获取当前工作表的表头
    headers() {
      return this.currentWorkbook.headers || [];
    },
    // 计算总数据量
    totalItems() {
      return this.excelData.length;
    },
    // 计算总页数
    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize);
    },
    // 当前页面开始的数据索引
    startItemIndex() {
      return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    },
    // 当前页面结束的数据索引
    endItemIndex() {
      return Math.min(this.currentPage * this.pageSize, this.totalItems);
    },
    // 分页后的数据
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.excelData.slice(start, end);
    },
    // 计算显示的页码按钮
    displayedPageNumbers() {
      if (this.totalPages <= 5) {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
      }
      
      // 显示5个页码按钮，当前页在中间
      let start = Math.max(this.currentPage - 2, 1);
      let end = start + 4;
      
      if (end > this.totalPages) {
        end = this.totalPages;
        start = Math.max(end - 4, 1);
      }
      
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    },
    // 检查跳转页码是否有效
    isValidJumpPage() {
      const page = Number(this.jumpToPage);
      return page >= 1 && page <= this.totalPages && page !== this.currentPage;
    }
  },
  methods: {
    // 加载本地Excel文件
    loadLocalFile() {
      this.loading = true;
      
      // 使用fetch API加载本地文件
      fetch(LOCAL_EXCEL_FILE)
        .then(response => {
          if (!response.ok) {
            throw new Error('无法加载Excel文件');
          }
          return response.arrayBuffer();
        })
        .then(data => {
          try {
            const workbook = XLSX.read(data, { type: 'array' });
            
            // 解析所有工作表
            this.workbooks = workbook.SheetNames.map(sheetName => {
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet);
              const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
              
              return {
                name: sheetName,
                data: jsonData,
                headers: headers
              };
            });
            
            // 设置当前工作表为第一个
            this.currentWorkbookIndex = 0;
            
            // 重置分页信息
            this.currentPage = 1;
            this.jumpToPage = 1;
          } catch (error) {
            console.error('解析Excel文件出错:', error);
            alert('解析Excel文件出错，请检查文件格式是否正确');
          }
        })
        .catch(error => {
          console.error('加载文件失败:', error);
          alert('加载文件失败: ' + error.message);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    // 清除数据
    clearData() {
      this.workbooks = [];
      this.fileName = '本地Excel文件';
      this.currentWorkbookIndex = 0;
      this.currentPage = 1;
      this.jumpToPage = 1;
    },
    
    // 页码导航方法
    goToFirstPage() {
      this.currentPage = 1;
    },
    goToPrevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToLastPage() {
      this.currentPage = this.totalPages;
    },
    goToPage(page) {
      this.currentPage = page;
    },
    handleJumpToPage() {
      if (this.isValidJumpPage) {
        this.currentPage = Number(this.jumpToPage);
      }
    }
  },
  watch: {
    // 当工作表切换时，重置分页
    currentWorkbookIndex() {
      this.currentPage = 1;
      this.jumpToPage = 1;
    },
    // 当页大小改变时，可能需要调整当前页
    pageSize() {
      const newTotalPages = Math.ceil(this.totalItems / this.pageSize);
      if (this.currentPage > newTotalPages) {
        this.currentPage = newTotalPages || 1;
      }
      this.jumpToPage = this.currentPage;
    }
  },
  // 组件挂载后自动加载本地文件
  mounted() {
    this.loadLocalFile();
  }
};
</script>

<style scoped>
/* 整体容器样式 */
h2 {
  text-align: center;
  margin: 20px 0;
  color: #333;
}

/* 文件选择区域样式 */
.file-selector {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.load-btn {
  padding: 8px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.load-btn:hover {
  background-color: #45a049;
}

.clear-btn {
  margin-left: 15px;
  padding: 8px 15px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-btn:hover {
  background-color: #e53935;
}

.loading {
  margin-left: 15px;
  color: #2196F3;
  font-weight: bold;
}

/* 工作表选择器样式 */
.workbook-selector {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f1f8ff;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.workbook-selector label {
  margin-right: 10px;
  font-weight: bold;
}

.workbook-selector select {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

/* Excel数据展示区域样式 */
.excel-container {
  margin-top: 20px;
}

.excel-container h3 {
  margin-bottom: 15px;
  color: #555;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  padding: 12px;
  text-align: left;
  font-weight: bold;
  border: 1px solid #ddd;
}

td {
  padding: 10px;
  border: 1px solid #ddd;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr:hover {
  background-color: #f1f1f1;
}

/* 分页控制区域样式 */
.pagination-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.data-info {
  margin: 5px 0;
  color: #666;
}

.page-size-selector {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.page-size-selector label {
  margin-right: 10px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.pagination-controls button {
  padding: 6px 12px;
  margin: 0 2px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-controls button:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-controls button.active {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

.page-numbers {
  display: flex;
  margin: 0 10px;
}

.jump-to-page {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.jump-to-page label {
  margin-right: 10px;
}

.jump-to-page input {
  width: 60px;
  padding: 5px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.jump-to-page button {
  padding: 6px 12px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.jump-to-page button:hover:not(:disabled) {
  background-color: #0b7dda;
}

.jump-to-page button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-data {
  text-align: center;
  padding: 50px;
  background-color: #f9f9f9;
  border-radius: 5px;
  color: #666;
  font-style: italic;
}
</style>
