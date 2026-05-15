<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';
import StatCard from '../components/StatCard.vue';
import ReportTable from '../components/ReportTable.vue';
import TicketModal from '../components/TicketModal.vue';
import { Users, Clock, Activity } from 'lucide-vue-next';
import axios from 'axios';
import * as XLSX from 'xlsx';

const allTickets = ref<any[]>([]);
const reportData = ref<any[]>([]);
const isLoading = ref(true);
const lastUpdate = ref('Nunca');
const apiStatus = ref<'Online' | 'Offline' | 'Error' | 'Warning'>('Offline');
const lastError = ref<string | null>(null);
const currentSearchTerm = ref('');

const showModal = ref(false);
const selectedTicket = ref<any>(null);

const fetchReport = async () => {
  isLoading.value = true;
  lastError.value = null;
  try {
    const response = await axios.get('/api/reporte');
    if (response.data.success) {
      allTickets.value = response.data.data;
      filterTickets();
      apiStatus.value = 'Online';
      lastUpdate.value = new Date().toLocaleTimeString();
    } else {
      throw new Error(response.data.message || 'Error al obtener reporte');
    }
  } catch (error: any) {
    console.error('Error fetching report:', error);
    lastError.value = error.response?.data?.message || error.message || String(error);
    apiStatus.value = 'Error';
  } finally {
    isLoading.value = false;
  }
};

const filterTickets = () => {
  if (!currentSearchTerm.value) {
    reportData.value = allTickets.value;
  } else {
    const query = currentSearchTerm.value.toLowerCase();
    reportData.value = allTickets.value.filter((ticket: any) => 
      ticket.Ticket && String(ticket.Ticket).toLowerCase().includes(query)
    );
  }
};

const handleSearch = (query: string) => {
  currentSearchTerm.value = query;
  filterTickets();
};

const openModal = (ticket: any = null) => {
  selectedTicket.value = ticket;
  showModal.value = true;
};

const handleDelete = async (row: any) => {
  if (!confirm(`¿Estás seguro de eliminar el ticket ${row.Ticket}?`)) return;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await axios.post('/api/eliminarentrada', { Ticket: row.Ticket, Usuario: user.Login || 'Sistema' });
    await fetchReport();
  } catch (err: any) {
    alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
  }
};

const exportToExcel = () => {
  if (allTickets.value.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(allTickets.value);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
  XLSX.writeFile(workbook, `Reporte_Produccion_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const stats = computed(() => [
  { 
    title: 'Total Registros', 
    value: allTickets.value.length.toLocaleString(), 
    icon: Users, 
    trend: isLoading.value ? 'Cargando...' : 'Sincronizado', 
    trendUp: true 
  },
  { 
    title: 'Última Carga', 
    value: lastUpdate.value, 
    icon: Clock 
  },
  { 
    title: 'Estado API', 
    value: apiStatus.value, 
    icon: Activity, 
    trend: apiStatus.value === 'Online' ? 'Conectado' : 'Sin conexión', 
    trendUp: apiStatus.value === 'Online' 
  },
]);

onMounted(() => {
  fetchReport();
});
</script>

<template>
  <div class="h-screen bg-slate-50 flex overflow-hidden">
    <Sidebar 
      @addTicket="openModal(null)" 
      @exportExcel="exportToExcel" 
    />
    
    <main class="flex-1 lg:ml-64 flex flex-col min-w-0 h-screen overflow-hidden">
      <Header 
        title="Dashboard de Producción" 
        @search="handleSearch"
      />
      
      <!-- Contenedor principal con flex-1 y flex-col -->
      <div class="p-4 md:p-8 flex flex-col flex-1 min-h-0 max-w-[1600px] mx-auto w-full gap-4 md:gap-8">
        
        <!-- Contenedor superior fijo (Stats Grid y Error Alert) -->
        <div class="flex-shrink-0 space-y-4 md:space-y-8">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <StatCard 
              v-for="stat in stats" 
              :key="stat.title"
              v-bind="stat"
            />
          </div>

          <!-- Error Alert -->
          <div v-if="lastError" class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
            <div class="flex">
              <div class="flex-shrink-0">
                <Activity class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">
                  <span class="font-bold">Error de Conexión:</span> {{ lastError }}
                </p>
                <div class="mt-2 flex gap-3">
                  <button @click="fetchReport" class="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded font-medium transition-colors">
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Report Table Section contenedor flexible -->
        <div class="flex-1 min-h-0 overflow-hidden flex flex-col">
          <ReportTable 
            :data="reportData" 
            :loading="isLoading" 
            @refresh="fetchReport"
            @delete="handleDelete"
            @edit="openModal"
            class="h-full"
          />
        </div>
      </div>
    </main>

    <TicketModal 
      :show="showModal" 
      :ticket-data="selectedTicket" 
      @close="showModal = false" 
      @saved="fetchReport" 
    />
  </div>
</template>
