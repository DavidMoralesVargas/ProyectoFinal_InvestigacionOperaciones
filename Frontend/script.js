// --- Estado de la Aplicación ---
        let currentState = {
            mainMethod: null,
            algorithm: null,
            sources: 0,
            destinations: 0
        };

        const algorithmNames = {
            'nw_corner': 'Esquina Noroeste',
            'min_cost': 'Costo Mínimo',
            'vogel': 'Aproximación de Vogel',
            'compare': 'Comparativa de Métodos'
        };

        // --- Funciones de Utilidad para la Interfaz ---
        function hideAllViews() {
            document.getElementById('view-initial').classList.add('hidden');
            document.getElementById('view-graphical').classList.add('hidden');
            document.getElementById('view-transport-config').classList.add('hidden');
            document.getElementById('view-transport-matrix').classList.add('hidden');
        }

        function resetSidebarSelection(level) {
            if (level <= 1) {
                document.querySelectorAll('#btn-graphical, #btn-transport').forEach(el => {
                    el.classList.remove('border-blue-500', 'bg-blue-50');
                    el.classList.add('border-transparent', 'bg-gray-50');
                });
                document.getElementById('submenu-transport').classList.add('hidden');
            }
            if (level <= 2) {
                document.querySelectorAll('#submenu-transport button').forEach(el => {
                    el.classList.remove('bg-blue-100', 'text-blue-700', 'font-semibold');
                });
            }
        }

        // --- Manejadores de Eventos del Menú ---
        
        function selectMainMethod(method) {
            currentState.mainMethod = method;
            currentState.algorithm = null;
            
            resetSidebarSelection(1);
            hideAllViews();

            const btn = document.getElementById(`btn-${method}`);
            btn.classList.remove('border-transparent', 'bg-gray-50');
            btn.classList.add('border-blue-500', 'bg-blue-50');

            if (method === 'graphical') {
                document.getElementById('view-graphical').classList.remove('hidden');
            } else if (method === 'transport') {
                document.getElementById('submenu-transport').classList.remove('hidden');
                document.getElementById('view-initial').classList.remove('hidden');
                // Actualizar texto instructivo
                document.querySelector('#view-initial p').textContent = "Seleccione un algoritmo específico de transporte para continuar.";
            }
        }

        function selectAlgorithm(algorithm) {
            currentState.algorithm = algorithm;
            
            resetSidebarSelection(3);
            hideAllViews();

            const btn = document.getElementById(`btn-${algorithm}`);
            btn.classList.add('bg-blue-100', 'text-blue-700', 'font-semibold');

            // Actualizar títulos en la vista de configuración
            document.getElementById('transport-badge').textContent = algorithmNames[algorithm];
            
            document.getElementById('view-transport-config').classList.remove('hidden');
        }

        // --- Generación de Matriz ---
        function generateMatrix() {
            const sourcesInput = document.getElementById('num-sources').value;
            const destInput = document.getElementById('num-destinations').value;

            const sources = parseInt(sourcesInput);
            const destinations = parseInt(destInput);

            if (isNaN(sources) || isNaN(destinations) || sources < 1 || destinations < 1) {
                showModal('Error de Validación', 'Por favor, ingrese valores numéricos válidos mayores a 0 para orígenes y destinos.', 'error');
                return;
            }

            currentState.sources = sources;
            currentState.destinations = destinations;

            const table = document.getElementById('matrix-table');
            table.innerHTML = ''; // Limpiar tabla anterior

            // Crear encabezado (Destinos + Demanda)
            let thead = '<thead class="text-sm text-gray-700 uppercase bg-gray-50 border-b-2 border-gray-200"><tr>';
            thead += '<th scope="col" class="px-6 py-4 bg-gray-100 min-w-[120px] border-r border-gray-200"></th>'; // Esquina superior izquierda vacía
            
            for (let j = 1; j <= destinations; j++) {
                thead += `<th scope="col" class="px-4 py-4 text-center min-w-[120px]">Destino ${j}</th>`;
            }
            thead += '<th scope="col" class="px-4 py-4 text-center bg-blue-50 text-blue-800 min-w-[120px] border-l-2 border-blue-200 font-bold">Oferta</th>';
            thead += '</tr></thead>';
            table.innerHTML += thead;

            // Crear cuerpo (Orígenes + Costos + Oferta)
            let tbody = '<tbody class="text-base">';
            for (let i = 1; i <= sources; i++) {
                tbody += `<tr class="bg-white hover:bg-gray-50">`;
                tbody += `<th scope="row" class="px-6 py-3 font-semibold text-gray-900 whitespace-nowrap bg-gray-50 border-r border-gray-200">Origen ${i}</th>`;
                
                for (let j = 1; j <= destinations; j++) {
                    tbody += `<td class="p-0 h-16 min-w-[120px]">
                                <input type="number" id="cost_${i}_${j}" placeholder="Costo" class="matrix-input text-gray-700 text-lg" min="0" step="any">
                              </td>`;
                }
                // Input de Oferta para este origen
                tbody += `<td class="p-0 h-16 min-w-[120px] border-l-2 border-blue-200 bg-blue-50/30">
                            <input type="number" id="supply_${i}" placeholder="Oferta" class="matrix-input font-bold text-blue-700 bg-transparent text-lg" min="0" step="any">
                          </td>`;
                tbody += `</tr>`;
            }

            // Fila final: Demanda
            let tfoot = '<tfoot class="border-t-2 border-blue-200 text-base"><tr class="bg-green-50/30">';
            tfoot += '<th scope="row" class="px-6 py-4 font-bold text-green-800 bg-green-50 border-r border-green-200">Demanda</th>';
            for (let j = 1; j <= destinations; j++) {
                tfoot += `<td class="p-0 h-16 min-w-[120px] border-t-2 border-green-200">
                            <input type="number" id="demand_${j}" placeholder="Demanda" class="matrix-input font-bold text-green-700 bg-transparent text-lg" min="0" step="any">
                          </td>`;
            }
            // Esquina inferior derecha (vacía o total)
            tfoot += '<td class="bg-gray-100 border-l-2 border-t-2 border-gray-200"></td>';
            tfoot += '</tr></tfoot>';

            table.innerHTML += tbody + tfoot;

            // Mostrar vista de matriz
            document.getElementById('view-transport-config').classList.add('hidden');
            document.getElementById('view-transport-matrix').classList.remove('hidden');
        }

        function backToConfig() {
            document.getElementById('view-transport-matrix').classList.add('hidden');
            document.getElementById('view-transport-config').classList.remove('hidden');
        }

        // --- Recopilación de Datos y Simulación de Envío ---
        function submitDataToServer() {
            const { sources, destinations, algorithm } = currentState;
            
            // 1. Recopilar matriz de costos
            let costs = [];
            for (let i = 1; i <= sources; i++) {
                let row = [];
                for (let j = 1; j <= destinations; j++) {
                    const val = document.getElementById(`cost_${i}_${j}`).value;
                    if (val === '') {
                        showModal('Datos Incompletos', `Falta el costo en el Origen ${i}, Destino ${j}.`, 'warning');
                        return;
                    }
                    row.push(parseFloat(val));
                }
                costs.push(row);
            }

            // 2. Recopilar oferta
            let supply = [];
            let totalSupply = 0;
            for (let i = 1; i <= sources; i++) {
                const val = document.getElementById(`supply_${i}`).value;
                if (val === '') {
                    showModal('Datos Incompletos', `Falta la oferta para el Origen ${i}.`, 'warning');
                    return;
                }
                const numVal = parseFloat(val);
                supply.push(numVal);
                totalSupply += numVal;
            }

            // 3. Recopilar demanda
            let demand = [];
            let totalDemand = 0;
            for (let j = 1; j <= destinations; j++) {
                const val = document.getElementById(`demand_${j}`).value;
                if (val === '') {
                    showModal('Datos Incompletos', `Falta la demanda para el Destino ${j}.`, 'warning');
                    return;
                }
                const numVal = parseFloat(val);
                demand.push(numVal);
                totalDemand += numVal;
            }

            // Estructura de datos lista para enviar al backend (Python)
            const payload = {
                method: 'transport',
                algorithm: algorithm,
                data: {
                    costs: costs,
                    supply: supply,
                    demand: demand
                }
            };

            console.log("Datos listos para enviar al servidor:", JSON.stringify(payload, null, 2));

            // Validar balance (opcional, tu backend Python también debería hacerlo)
            let balanceMessage = "";
            if (totalSupply !== totalDemand) {
                balanceMessage = `Nota: El problema no está balanceado (Oferta: ${totalSupply}, Demanda: ${totalDemand}). El servidor deberá agregar un origen o destino ficticio.`;
            } else {
                balanceMessage = "El problema está balanceado.";
            }

            // --- AQUÍ HARÍAS TU LLAMADA FETCH AL BACKEND PYTHON ---
            console.log(algorithm, payload);
            fetch(`http://127.0.0.1:8000/api/${algorithm}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {

                if (algorithm === "compare") {

                    function calcularTotal(resultado, costos) {
                        let total = 0;

                        for (let i = 0; i < resultado.length; i++) {
                            total += resultado[i] * costos[i];
                        }

                        return total;
                    }

                    const totalCostoMinimo = calcularTotal(
                        data.resultadoCostoMinimo,
                        data.costosCostoMinimo
                    );

                    const totalEsquina = calcularTotal(
                        data.resultadoEsquina,
                        data.costosEsquina
                    );

                    const totalVogel = calcularTotal(
                        data.resultadoVoguel,
                        data.costosVoguel
                    );

                    const mensaje = `
                        <table style="width:100%; border-collapse:collapse; text-align:center;">
                            <thead>
                                <tr>
                                    <th style="border:1px solid #ddd;padding:8px;">
                                        Método
                                    </th>
                                    <th style="border:1px solid #ddd;padding:8px;">
                                        Costo Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border:1px solid #ddd;padding:8px;">
                                        Costo Mínimo
                                    </td>
                                    <td style="border:1px solid #ddd;padding:8px;">
                                        ${totalCostoMinimo}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border:1px solid #ddd;padding:8px;">
                                        Esquina Noroeste
                                    </td>
                                    <td style="border:1px solid #ddd;padding:8px;">
                                        ${totalEsquina}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border:1px solid #ddd;padding:8px;">
                                        Vogel
                                    </td>
                                    <td style="border:1px solid #ddd;padding:8px;">
                                        ${totalVogel}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    `;

                    showModal(
                        'Comparación de Métodos',
                        mensaje,
                        'success'
                    );

                    return;
                }

                // Tu código actual para min_cost, nw_corner y vogel
                let sumaProducto = 0;

                let mensaje = `
                    <table style="width:100%; border-collapse:collapse; text-align:center;">
                        <thead>
                            <tr>
                                <th style="border:1px solid #ddd; padding:8px;">Resultado</th>
                                <th style="border:1px solid #ddd; padding:8px;">Costo</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                for(let i = 0; i < data.resultado.length; i++) {

                    sumaProducto += data.resultado[i] * data.costos[i];

                    mensaje += `
                        <tr>
                            <td style="border:1px solid #ddd; padding:8px;">
                                ${data.resultado[i]}
                            </td>
                            <td style="border:1px solid #ddd; padding:8px;">
                                ${data.costos[i]}
                            </td>
                        </tr>
                    `;
                }

                mensaje += `
                        </tbody>
                    </table>

                    <div style="margin-top:15px; font-size:18px; font-weight:bold;">
                        Σ(Resultado × Costo) = ${sumaProducto}
                    </div>
                `;

                showModal(
                    'Resultado Método',
                    mensaje,
                    'success'
                );

            })
        }

        function mostrarResultados(data) {
            console.log(data)
        }

        // --- Sistema de Modales Personalizados ---
        function showModal(title, message, type = 'info') {
            const modal = document.getElementById('notification-modal');
            const titleEl = document.getElementById('modal-title');
            const messageEl = document.getElementById('modal-message');
            const iconEl = document.getElementById('modal-icon');
            const iconContainer = document.getElementById('modal-icon-container');

            titleEl.textContent = title;
            messageEl.innerHTML = message; // Usamos innerHTML para permitir etiquetas simples como <br>

            // Resetear clases de color y tamaño
            iconContainer.className = 'flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto';
            iconEl.className = 'text-3xl';

            if (type === 'error') {
                iconContainer.classList.add('bg-red-100');
                iconEl.classList.add('fas', 'fa-times', 'text-red-600');
            } else if (type === 'warning') {
                iconContainer.classList.add('bg-yellow-100');
                iconEl.classList.add('fas', 'fa-exclamation-triangle', 'text-yellow-600');
            } else if (type === 'success') {
                iconContainer.classList.add('bg-green-100');
                iconEl.classList.add('fas', 'fa-check', 'text-green-600');
            } else {
                iconContainer.classList.add('bg-blue-100');
                iconEl.classList.add('fas', 'fa-info', 'text-blue-600');
            }

            modal.classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('notification-modal').classList.add('hidden');
        }