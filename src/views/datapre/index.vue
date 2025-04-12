<template>
  <div class="inflammation-prediction-container">
    <h1>炎性指标预测结果展示</h1>
    
    <div class="image-selection">
      <el-select v-model="selectedImage" placeholder="请选择预测图片" @change="loadImage">
        <el-option
          v-for="item in imageOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    
    <div v-if="imagePath" class="results-container">
      <div class="image-display">
        <h2>预测效果图</h2>
        <img :src="imagePath" class="result-image" />
      </div>
      
      <div class="image-details" v-if="selectedImage">
        <h3>图片信息</h3>
        <p>文件名：{{ selectedImage }}</p>
        <p>预测时间：{{ getCurrentTime() }}</p>
      </div>
    </div>
    
    <div v-else class="no-image-hint">
      <p>请选择一张预测效果图进行查看</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PredictionImageViewer',
  data() {
    return {
      selectedImage: '',
      imagePath: '',
      imageOptions: [
        { value: 'SII_Pre.png', label: '训练结果1 - SII指标' },
        { value: 'CRP_Pre.png', label: '训练结果2 - CRP指标' },
        { value: 'Pts_SII_Pre.png', label: '预测结果1 - SII指标' },
        { value: 'Pts_CRP_Pre.png', label: '预测结果2 - CRP指标' },
      ]
    }
  },
  methods: {
    loadImage() {
      if (this.selectedImage) {
        // 这里假设图片存放在public文件夹下的images目录中
        // 在实际使用中，请根据您的项目结构调整路径
        this.imagePath = `/public/${this.selectedImage}`;
        
        // 如果您使用的是相对路径或本地文件系统路径，可能需要调整
        // 例如使用require:
        // this.imagePath = require(`@/assets/images/${this.selectedImage}`);
      } else {
        this.imagePath = '';
      }
    },
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleString('zh-CN');
    }
  }
}
</script>

<style scoped>
.inflammation-prediction-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.image-selection {
  margin: 20px 0;
  text-align: center;
}

.results-container {
  margin-top: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-display {
  text-align: center;
  margin-bottom: 20px;
}

.result-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.image-details {
  margin-top: 20px;
  padding: 15px;
  background-color: #f7f7f7;
  border-radius: 4px;
}

.no-image-hint {
  text-align: center;
  margin-top: 50px;
  color: #909399;
  font-size: 16px;
}

h1, h2, h3 {
  color: #303133;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}
</style>
