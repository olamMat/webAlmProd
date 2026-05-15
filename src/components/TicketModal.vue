<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { X, Save, Loader2 } from 'lucide-vue-next';
import axios from 'axios';

const props = defineProps<{
  show: boolean;
  ticketData?: any;
}>();

const emit = defineEmits(['close', 'saved']);

const loading = ref(false);
const error = ref<string | null>(null);

// Listas para los combos (estandarizadas con Id y Valor)
const lists = ref<Record<string, any[]>>({
  TipoProceso: [],
  Propiedad: [],
  Material: [],
  QualityGrade: [],
  Taza: [],
  Certificacion: [],
  TipoEmpaque: [],
  Vendor: [],
  Bodega: [],
  Ubicacion: []
});

const form = ref({
  Ticket: '',
  TipoProceso: '',
  Propiedad: '',
  Fecha: new Date().toISOString().split('T')[0],
  Material: '',
  QualityGrade: '',
  Taza: '',
  Certificacion: '',
  KilosNetos: 0,
  Sacos: 0,
  TipoEmpaque: '',
  Vendor: '',
  Bodega: '',
  Ubicacion: '',
  Referencia: '',
  ICO: ''
});

// Cargar catálogos
const loadCombos = async () => {
  // Nombres EXACTOS que espera tu API en el SP MostrarListasMaestro
  const fields = ['Proceso', 'Propiedad', 'Material', 'Quality', 'Taza', 'Certificacion', 'TipoEmpaque', 'Vendor'];
  try {
    const promises = fields.map(field => axios.post('/api/cargarcombos', { Campo: field }));
    const results = await Promise.all(promises);
    
    // Extraer siempre Id y Valor (string)
    const extractList = (data: any[]) => {
      if (!data) return [];
      return data.map(item => {
        const val = item.Valor || item.Nombre || item.Descripcion || Object.values(item)[1] || Object.values(item)[0];
        return {
          Id: item.IdValor || item.Id || item.ID || 0,
          Valor: String(val || '').trim()
        };
      });
    };

    lists.value.TipoProceso = extractList(results[0].data.data);
    lists.value.Propiedad = extractList(results[1].data.data);
    lists.value.Material = extractList(results[2].data.data);
    lists.value.QualityGrade = extractList(results[3].data.data);
    lists.value.Taza = extractList(results[4].data.data);
    lists.value.Certificacion = extractList(results[5].data.data);
    lists.value.TipoEmpaque = extractList(results[6].data.data);
    lists.value.Vendor = extractList(results[7].data.data);

    // Cargar Bodegas
    const resBodega = await axios.get('/api/mostrarbodega');
    lists.value.Bodega = resBodega.data.data.map((b: any) => ({
      Id: b.IdBodega || 0,
      Valor: String(b.Bodega || '').trim()
    }));
  } catch (err) {
    console.error('Error al cargar combos:', err);
  }
};

// Cargar ubicaciones cuando cambie la bodega
watch(() => form.value.Bodega, async (newBodega) => {
  if (!newBodega) {
    lists.value.Ubicacion = [];
    return;
  }
  try {
    const bodegaObj = lists.value.Bodega.find(b => b.Valor === newBodega);
    if (bodegaObj) {
      const res = await axios.post('/api/mostrarubicacion', { IdBodega: bodegaObj.Id });
      lists.value.Ubicacion = res.data.data.map((u: any) => {
        const val = u.UbicacionB || u.Ubicacion || u.Nombre || u.Valor || Object.values(u)[0];
        return {
          Id: u.IdUbicacionB || u.Id || 0,
          Valor: String(val || '').trim()
        };
      });

      if (form.value.Ubicacion) {
        const match = lists.value.Ubicacion.find(opt => opt.Valor && opt.Valor.toLowerCase() === form.value.Ubicacion.toLowerCase());
        if (match) {
          form.value.Ubicacion = match.Valor;
        }
      }
    }
  } catch (err) {
    console.error('Error al cargar ubicaciones:', err);
  }
});

onMounted(() => {
  loadCombos();
});

watch(() => props.ticketData, (newVal) => {
  if (newVal) {
    const getVal = (keys: string[], listName: string = '') => {
      const targetKeys = keys.map(k => k.toLowerCase().replace(/\s/g, ''));
      let extractedValue = '';
      for (const [k, v] of Object.entries(newVal)) {
        const cleanK = k.toLowerCase().replace(/\s/g, '');
        if (targetKeys.includes(cleanK) && v !== null && v !== undefined) {
          extractedValue = String(v).trim();
          break;
        }
      }

      if (extractedValue && listName && lists.value[listName]) {
        const match = lists.value[listName].find(opt => opt.Valor && opt.Valor.toLowerCase() === extractedValue.toLowerCase());
        if (match) {
          return match.Valor;
        }
      }

      return extractedValue;
    };

    form.value = {
      Ticket: getVal(['Ticket']),
      TipoProceso: getVal(['TipoProceso', 'Proceso', 'TipoProc', 'Tipo_Proceso']),
      Propiedad: getVal(['Propiedad']),
      Fecha: getVal(['Fecha', 'FechaEntrada', 'FechaIngreso', 'FechaProd', 'Fecha_Entrada']),
      Material: getVal(['Material', 'Producto']),
      QualityGrade: getVal(['QualityGrade', 'Quality', 'Calidad', 'GradoCalidad', 'Grado']),
      Taza: getVal(['Taza', 'Cup']),
      Certificacion: getVal(['Certificacion', 'Certificado']),
      KilosNetos: Number(getVal(['KilosNetos', 'Kilos', 'KilosEntrada', 'Kilos_Entrada']) || 0),
      Sacos: Number(getVal(['Sacos', 'SacosEntrada', 'Sacos_Entrada']) || 0),
      TipoEmpaque: getVal(['TipoEmpaque', 'Empaque']),
      Vendor: getVal(['Vendor', 'Proveedor']),
      Bodega: getVal(['Bodega', 'Almacen']),
      Ubicacion: getVal(['Ubicacion', 'UbicacionB']),
      Referencia: getVal(['Referencia', 'Ref']),
      ICO: getVal(['ICO'])
    };

    if (form.value.Fecha) {
      if (form.value.Fecha.includes('/Date(')) {
        const timestamp = parseInt(form.value.Fecha.match(/\/Date\((\d+)\)\//)?.[1] || '0');
        form.value.Fecha = new Date(timestamp).toISOString().split('T')[0];
      } else {
        try {
          const date = new Date(form.value.Fecha);
          if (!isNaN(date.getTime())) {
            form.value.Fecha = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error al formatear fecha:', e);
        }
      }
    }
  } else {
    form.value = {
      Ticket: '',
      TipoProceso: '',
      Propiedad: '',
      Fecha: new Date().toISOString().split('T')[0],
      Material: '',
      QualityGrade: '',
      Taza: '',
      Certificacion: '',
      KilosNetos: 0,
      Sacos: 0,
      TipoEmpaque: '',
      Vendor: '',
      Bodega: '',
      Ubicacion: '',
      Referencia: '',
      ICO: ''
    };
  }
}, { immediate: true });

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const payload = { 
      ...form.value, 
      ICO: form.value.ICO?.trim() || null,
      Referencia: form.value.Referencia?.trim() || null,
      Usuario: user.Login || 'Sistema' 
    };
    
    const endpoint = props.ticketData ? '/api/editarticket' : '/api/insertarticket';
    const response = await axios.post(endpoint, payload);
    
    if (response.data.success) {
      emit('saved');
      emit('close');
    } else {
      throw new Error(response.data.message);
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <h3 class="text-xl font-bold text-slate-800">
          {{ ticketData ? 'Editar Ticket' : 'Nuevo Ticket' }}
        </h3>
        <button @click="emit('close')" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <X class="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <div class="space-y-4">
             <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
               <span class="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
               Identificación
             </h4>
             <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Número de Ticket</label>
                <input v-model="form.Ticket" type="text" required :disabled="!!ticketData" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800" placeholder="Ej: TK-12345" />
             </div>
             <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Fecha</label>
                <input v-model="form.Fecha" type="date" required class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800" />
             </div>
          </div>

          <div class="space-y-4">
             <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
               <span class="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
               Especificaciones
             </h4>
             <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Tipo Proceso</label>
                <select v-model="form.TipoProceso" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800">
                  <option value="">Seleccione...</option>
                  <option v-for="opt in lists.TipoProceso" :key="opt.Id" :value="opt.Valor">{{ opt.Valor }}</option>
                </select>
             </div>
             <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Propiedad</label>
                <select v-model="form.Propiedad" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800">
                  <option value="">Seleccione...</option>
                  <option v-for="opt in lists.Propiedad" :key="opt.Id" :value="opt.Valor">{{ opt.Valor }}</option>
                </select>
             </div>
             <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Material</label>
                <select v-model="form.Material" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800">
                  <option value="">Seleccione...</option>
                  <option v-for="opt in lists.Material" :key="opt.Id" :value="opt.Valor">{{ opt.Valor }}</option>
                </select>
             </div>
             <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Referencia</label>
                  <input v-model="form.Referencia" type="text" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800" placeholder="Ref" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">ICO</label>
                  <input v-model="form.ICO" type="text" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800" placeholder="ICO" />
                </div>
             </div>
          </div>

          <div class="space-y-4">
             <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
               <span class="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
               Calidad y Grado
             </h4>
             <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Quality Grade</label>
                <select v-model="form.QualityGrade" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800">
                  <option value="">Seleccione...</option>
                  <option v-for="opt in lists.QualityGrade" :key="opt.Id" :value="opt.Valor">{{ opt.Valor }}</option>
                </select>
             </div>
             <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Taza</label>
                  <select v-model="form.Taza" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800">
                    <option value="">Seleccione...</option>
                    <option v-for="opt in lists.Taza" :key="opt.Id" :value="opt.Valor">{{ opt.Valor }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Certificación</label>
                  <select v-model="form.Certificacion" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800">
                    <option value="">Seleccione...</option>
                    <option v-for="opt in lists.Certificacion" :key="opt.Id" :value="opt.Valor">{{ opt.Valor }}</option>
                  </select>
                </div>
             </div>
             <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Vendor</label>
                <select v-model="form.Vendor" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800">
                  <option value="">Seleccione...</option>
                  <option v-for="opt in lists.Vendor" :key="opt.Id" :value="opt.Valor">{{ opt.Valor }}</option>
                </select>
             </div>
          </div>

          <div class="space-y-4">
             <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
               <span class="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
               Cantidades y Empaque
             </h4>
             <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Sacos</label>
                  <input v-model.number="form.Sacos" type="number" step="0.01" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Kilos Netos</label>
                  <input v-model.number="form.KilosNetos" type="number" step="0.01" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800" />
                </div>
             </div>
             <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Tipo Empaque</label>
                <select v-model="form.TipoEmpaque" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800">
                  <option value="">Seleccione...</option>
                  <option v-for="opt in lists.TipoEmpaque" :key="opt.Id" :value="opt.Valor">{{ opt.Valor }}</option>
                </select>
             </div>
          </div>

          <div class="space-y-4">
             <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
               <span class="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
               Logística de Almacén
             </h4>
             <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Bodega</label>
                <select v-model="form.Bodega" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800">
                  <option value="">Seleccione bodega...</option>
                  <option v-for="opt in lists.Bodega" :key="opt.Id" :value="opt.Valor">{{ opt.Valor }}</option>
                </select>
             </div>
             <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Ubicación</label>
                <select v-model="form.Ubicacion" :disabled="!form.Bodega" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-800">
                  <option value="">Seleccione ubicación...</option>
                  <option v-for="opt in lists.Ubicacion" :key="opt.Id" :value="opt.Valor">{{ opt.Valor }}</option>
                </select>
             </div>
          </div>
        </div>

        <div v-if="error" class="mt-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
          <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
             <X class="w-4 h-4" />
          </div>
          {{ error }}
        </div>
      </form>

      <div class="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
        <button @click="emit('close')" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
          Cancelar
        </button>
        <button 
          @click="handleSubmit" 
          :disabled="loading"
          class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          {{ loading ? 'Guardando...' : 'Guardar Ticket' }}
        </button>
      </div>
    </div>
  </div>
</template>
