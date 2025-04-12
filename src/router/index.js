import { createRouter, createWebHistory } from 'vue-router';
import Index from '@/views/index/index.vue';
import Ward from '@/views/ward/index.vue';
import Pts from '@/views/pts/index.vue';
import Dept from '@/views/dept/index.vue';
import Emp from '@/views/emp/index.vue';
import EmpReport from '@/views/report/emp/index.vue';
import PtsReport from '@/views/report/Pts/index.vue';
import Log from '@/views/log/index.vue';
import Login from '@/views/login/index.vue';
import Layout from '@/views/layout/index.vue';
import Importance from '@/views/importance/index.vue';
import PtsData from '@/views/ptsdata/index.vue';

const routes = [
  { path: '/', 
    component: Layout,
    redirect: '/index',
    children: [
      { path: '/index', component: Index },
      { path: '/ward', component: Ward },
      { path: '/pts', component: Pts },
      { path: '/dept', component: Dept },
      { path: '/emp', component: Emp },
      { path: '/report/emp', component: EmpReport },
      { path: '/report/pts', component: PtsReport },
      { path: '/log', component: Log },
      { path: '/importance', component: Importance },
      { path: '/ptsdata', component: PtsData },
    ]
  },
  { path: '/login', component: Login }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;