<template>
  <div class="importance-analysis-container">
    <div class="page-header">
      <h1 class="main-title">炎性指标特征重要性分析</h1>
      <div class="subtitle"></div>
    </div>
    
    <!-- 图表展示卡片 -->
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">特征重要性可视化</span>
          <div class="header-controls">
            <el-button type="primary" size="small" @click="downloadImage">
              <i class="el-icon-download"></i> 下载图表
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="image-container">
        <img src="/importance.png" alt="特征重要性分析图" class="importance-image" />
      </div>
    </el-card>
    
    <!-- 说明卡片 -->
    <el-card class="analysis-card description-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">分析说明</span>
        </div>
      </template>
      
      <div class="description-content">
        <p>本分析展示了各炎性指标与CRP的相关性及其在预测模型中的重要性。</p>
      </div>
    </el-card>
    
    <!-- 数据摘要卡片-->
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">重要特征摘要</span>
        </div>
      </template>
      
      <el-table :data="topFeatures" stripe style="width: 100%">
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="feature" label="特征名称" width="150"/>
        <el-table-column prop="description" label="临床意义"/>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ImportanceAnalysis',
  setup() {
    // 图片路径 - 您可以根据实际情况修改
    const importanceImagePath = ref('/importance.png')
    
    // 示例数据 - 您可以根据实际情况修改
    const topFeatures = ref([
      { rank: 1, feature: 'IL6', description: '白细胞介素6，是一种多功能细胞因子，由T淋巴细胞、单核细胞、巨噬细胞、内皮细胞等多种细胞分泌。IL-6通过激活JAK-STAT信号通路，诱导肝细胞产生急性期蛋白(如CRP)，介导发热反应，并调节B淋巴细胞分化和抗体产生。在败血症、自身免疫性疾病和肿瘤等多种病理状态中水平显著升高，其浓度变化往往先于CRP，具有早期诊断价值。IL-6水平与疾病严重程度呈正相关，因此也被视为预后指标。' },
      { rank: 2, feature: 'ESR', description: '红细胞沉降率，反映红细胞在一小时内下沉的距离。ESR主要受血浆中纤维蛋白原、球蛋白等大分子蛋白浓度的影响。在炎症状态下，这些急性期蛋白增加，导致ESR加快。ESR是一种非特异性但敏感的炎症指标，对慢性炎症尤为敏感，在类风湿关节炎、结缔组织病等疾病监测中具有重要价值。ESR上升相对缓慢，通常在炎症发生后24-48小时达到高峰，恢复也较为缓慢。' },
      { rank: 3, feature: 'PTC', description: '降钙素原，在正常生理状态下主要由甲状腺C细胞产生。在细菌感染和内毒素刺激下，全身组织和器官均可产生PTC。与其他炎症标志物相比，PTC对细菌感染具有较高的特异性，能有效区分细菌感染与病毒感染及非感染性炎症。PTC水平与感染严重程度正相关，可用于指导抗生素治疗决策并监测治疗效果。' },
      { rank: 4, feature: 'Neuc_Abs', description: '中性粒细胞绝对值，反映外周血中中性粒细胞的绝对数量。中性粒细胞是急性炎症反应中的主要效应细胞，通过趋化作用迅速募集到炎症部位，参与吞噬病原体和分泌细胞因子等功能。中性粒细胞计数升高(>7.5×10^9/L)通常提示细菌感染或组织损伤，在感染性疾病、创伤后和某些自身免疫性疾病中常见。' },
      { rank: 5, feature: 'SII', description: '系统性免疫炎症指数，是结合中性粒细胞、淋巴细胞和血小板三种细胞计数的综合指数(SII = 中性粒细胞×血小板/淋巴细胞)。SII综合反映了机体炎症状态和免疫功能，在评估肿瘤患者预后、自身免疫性疾病活动度等方面具有优势。高SII值通常与更严重的炎症反应、更差的疾病预后相关。' },
      { rank: 6, feature: 'Disease_Course', description: '疾病病程' },
      { rank: 7, feature: 'Creatinine', description: '肌酐，评估肾功能的重要指标，炎症状态可能影响肾功能' },
      { rank: 8, feature: 'Potassium', description: '血钾，电解质平衡的重要指标，炎症过程中可能出现紊乱' },
      { rank: 9, feature: 'Urea', description: '尿素，反映肾脏排泄功能，在炎症相关肾功能改变中有参考价值' },
      { rank: 10, feature: 'BMI', description: '体质指数' },
      { rank: 11, feature: 'PLT', description: '血小板计数，参与炎症和凝血过程，炎症状态下可能升高' },
      { rank: 12, feature: 'TBiI', description: '总胆红素，肝功能指标，炎症可能影响胆红素代谢' },
      { rank: 13, feature: 'PLR', description: '血小板与淋巴细胞比值，反映免疫系统与炎症状态的平衡' },
      { rank: 14, feature: 'Sodium', description: '血钠，重要电解质，炎症状态下可能发生钠代谢异常' },
      { rank: 15, feature: 'Lymph_Abs', description: '淋巴细胞绝对值，反映免疫功能状态，炎症过程中可能下降' },
      { rank: 16, feature: 'Age', description: '年龄' },
      { rank: 17, feature: 'Gender', description: '性别' },
      { rank: 18, feature: 'Smoking_History', description: '吸烟史' }
      
    ])
    
    // 下载图片功能
    const downloadImage = () => {
      const link = document.createElement('a')
      link.href = importanceImagePath.value
      link.download = '炎性指标特征重要性.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    return {
      importanceImagePath,
      topFeatures,
      downloadImage
    }
  }
}
</script>

<style scoped>
.importance-analysis-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.main-title {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.subtitle {
  color: #606266;
  font-size: 16px;
}

.analysis-card {
  margin-bottom: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.analysis-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.image-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
}

.importance-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.description-card {
  background-color: #f0f9eb;
}

.description-content {
  font-size: px;
  line-height: 1.6;
  color: #444;
}

.legend-section {
  margin-top: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header {
    margin-bottom: 20px;
  }
  
  .main-title {
    font-size: 22px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  .importance-image {
    max-height: 400px;
  }
}
</style>
