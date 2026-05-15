<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';
import StatCard from '../components/StatCard.vue';
import ReportTable from '../components/ReportTable.vue';
import TicketModal from '../components/TicketModal.vue';
import { Users, Clock, Activity, CheckCircle2, AlertCircle } from 'lucide-vue-next';
import axios from 'axios';
import * as XLSX from 'xlsx';

const allTickets = ref<any[]>([]);
const reportData = ref<any[]>([]);
const isLoading = ref(true);
const lastUpdate = ref('Nunca');
const apiStatus = ref<'Online' | 'Offline' | 'Error' | 'Warning'>('Offline');
const lastError = ref<string | null>(null);
const currentSearchTerm = ref('');
const selectedStatus = ref<string | null>(null);
const pollingId = ref<any>(null);
const showSidebar = ref(false);

const showModal = ref(false);
const selectedTicket = ref<any>(null);

const fetchReport = async (isSilent = false) => {
  if (!isSilent) {
    isLoading.value = true;
    lastError.value = null;
  }
  
  try {
    const response = await axios.get('/api/reporte');
    if (response.data.success) {
      allTickets.value = response.data.data;
      filterTickets();
      apiStatus.value = 'Online';
      lastUpdate.value = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      // Clear error if success
      if (isSilent) lastError.value = null;
    } else {
      throw new Error(response.data.message || 'Error al obtener reporte');
    }
  } catch (error: any) {
    console.error('Error fetching report:', error);
    if (!isSilent) {
      lastError.value = error.response?.data?.message || error.message || String(error);
      apiStatus.value = 'Error';
    }
  } finally {
    if (!isSilent) {
      isLoading.value = false;
    }
  }
};

const startAdaptivePolling = () => {
  if (pollingId.value) clearTimeout(pollingId.value);
  
  const setupNextPoll = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Horario laboral: 7am a 5pm (17:00)
    const isBusinessHours = hour >= 7 && hour < 17;
    const interval = isBusinessHours ? 2 * 60 * 1000 : 30 * 60 * 1000;
    
    pollingId.value = setTimeout(async () => {
      await fetchReport(true);
      setupNextPoll(); // Recursive call to re-evaluate hours
    }, interval);
  };
  
  setupNextPoll();
};

const filterTickets = () => {
  let filtered = allTickets.value;

  // Filtro por término de búsqueda
  if (currentSearchTerm.value) {
    const query = currentSearchTerm.value.toLowerCase();
    filtered = filtered.filter((ticket: any) => 
      ticket.Ticket && String(ticket.Ticket).toLowerCase().includes(query)
    );
  }

  // Filtro por estado seleccionado
  if (selectedStatus.value) {
    filtered = filtered.filter((ticket: any) => 
      ticket.Estado === selectedStatus.value
    );
  }

  reportData.value = filtered;
};

const handleSearch = (query: string) => {
  currentSearchTerm.value = query;
  filterTickets();
};

const handleStatusFilter = (statTitle: string) => {
  if (statTitle === 'Total Registros' || statTitle === 'Última Carga' || statTitle === 'Estado API') {
    selectedStatus.value = null;
  } else {
    // El título es "Estado: XXXX", extraemos el nombre del estado
    const estado = statTitle.replace('Estado: ', '');
    selectedStatus.value = estado;
  }
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

  // Format dates before exporting to Excel
  const formattedData = allTickets.value.map(ticket => {
    const formattedTicket = { ...ticket };
    const dateColumns = ['Fecha Entrada', 'Fecha Prod'];
    
    dateColumns.forEach(col => {
      if (formattedTicket[col]) {
        let value = formattedTicket[col];
        let dateObj: Date | null = null;
        
        // Case 1: /Date(ms)/ format
        if (typeof value === 'string' && value.includes('/Date(')) {
          const timestamp = parseInt(value.match(/\/Date\((\d+)\)\//)?.[1] || '0');
          if (timestamp) dateObj = new Date(timestamp);
        } 
        // Case 2: ISO string or any string that can be parsed as a date
        else if (typeof value === 'string') {
          const parsedDate = new Date(value);
          if (!isNaN(parsedDate.getTime())) dateObj = parsedDate;
        }
        // Case 3: Already a Date object
        else if (value instanceof Date) {
          dateObj = value;
        }

        if (dateObj) {
          // Force string format DD/MM/AAAA to avoid Excel auto-parsing back to ISO
          const day = String(dateObj.getUTCDate()).padStart(2, '0');
          const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
          const year = dateObj.getUTCFullYear();
          formattedTicket[col] = `${day}/${month}/${year}`;
        }
      }
    });
    
    return formattedTicket;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData, { dateNF: 'dd/mm/yyyy' });
  
  // Ensure the specific columns are treated as strings or have the correct format
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!worksheet[address]) continue;
    const header = worksheet[address].v;
    if (header === 'Fecha Entrada' || header === 'Fecha Prod') {
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_col(C) + (R + 1);
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].t = 's'; // Force type to string
        }
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
  XLSX.writeFile(workbook, `Reporte_Produccion_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const stats = computed(() => {
  const baseStats = [
    { 
      title: 'Total Registros', 
      value: allTickets.value.length.toLocaleString(), 
      icon: Users, 
      trend: isLoading.value ? 'Cargando...' : 'Sincronizado', 
      trendUp: true,
      active: selectedStatus.value === null
    },
    { 
      title: 'Última Carga', 
      value: lastUpdate.value, 
      icon: Clock,
      active: false
    },
    { 
      title: 'Estado API', 
      value: apiStatus.value, 
      icon: Activity, 
      trend: apiStatus.value === 'Online' ? 'Conectado' : 'Sin conexión', 
      trendUp: apiStatus.value === 'Online',
      active: false
    },
  ];

  // Dynamic status counters based on "Estado" column
  const statusCounts = allTickets.value.reduce((acc: Record<string, number>, ticket: any) => {
    const estado = ticket.Estado || 'Sin Estado';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const dynamicStats = Object.entries(statusCounts).map(([estado, count]) => {
    let icon = Activity;
    const lowerEstado = estado.toLowerCase();
    
    if (lowerEstado.includes('terminado') || lowerEstado.includes('completado') || lowerEstado.includes('finalizado')) {
      icon = CheckCircle2;
    } else if (lowerEstado.includes('pendiente') || lowerEstado.includes('espera')) {
      icon = Clock;
    } else if (lowerEstado.includes('error') || lowerEstado.includes('fallo')) {
      icon = AlertCircle;
    }

    return {
      title: `Estado: ${estado}`,
      value: count.toLocaleString(),
      icon: icon,
      trend: 'Conteo dinámico',
      trendUp: true,
      active: selectedStatus.value === estado
    };
  });

  return [...baseStats, ...dynamicStats];
});

onMounted(() => {
  fetchReport();
  startAdaptivePolling();
});

onUnmounted(() => {
  if (pollingId.value) clearTimeout(pollingId.value);
});
</script>

<template>
  <div class="h-screen bg-slate-50 flex overflow-hidden relative">
    <Sidebar 
      :show="showSidebar"
      @addTicket="openModal(null)" 
      @exportExcel="exportToExcel" 
      @close="showSidebar = false"
    />
    
    <main class="flex-1 lg:ml-64 flex flex-col min-w-0 h-screen overflow-hidden">
      <Header 
        title="Dashboard de Producción" 
        @search="handleSearch"
        @toggleMenu="showSidebar = true"
      />
      
      <!-- Contenedor principal con flex-1 y flex-col -->
      <div class="p-4 md:p-8 flex flex-col flex-1 min-h-0 max-w-[1600px] mx-auto w-full gap-4 md:gap-8">
        
        <!-- Contenedor superior fijo (Stats Grid y Error Alert) -->
        <div class="flex-shrink-0 space-y-4">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <StatCard 
              v-for="stat in stats" 
              :key="stat.title"
              v-bind="stat"
              @click="handleStatusFilter(stat.title)"
            />
          </div>

          <!-- Active Filter Indicator -->
          <div v-if="selectedStatus" class="flex items-center justify-between bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg">
            <div class="flex items-center gap-2 text-indigo-700 text-sm font-medium">
              <Activity class="w-4 h-4" />
              Filtrando por estado: <span class="font-bold underline">{{ selectedStatus }}</span>
            </div>
            <button 
              @click="handleStatusFilter('Total Registros')"
              class="text-xs text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider"
            >
              Limpiar Filtro
            </button>
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
                  <button @click="() => { fetchReport(); }" class="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded font-medium transition-colors">
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
