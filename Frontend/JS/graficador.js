let graph = null;

function addConstraint() {

    const container =
        document.getElementById(
            "constraintsContainer"
        );

    container.insertAdjacentHTML(
        "beforeend",
        `
        <div class="restriction-row flex gap-2 mb-2 items-center">

            <input
                type="number"
                class="coef-x border p-2 rounded"
                placeholder="X">

            <input
                type="number"
                class="coef-y border p-2 rounded"
                placeholder="Y">

            <select
                class="operator border p-2 rounded">

                <option value="<=">
                    <=
                </option>

                <option value=">=">
                    >=
                </option>

                <option value="=">
                    =
                </option>

            </select>

            <input
                type="number"
                class="value border p-2 rounded"
                placeholder="Valor">

            <button
                type="button"
                onclick="removeConstraint(this)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded font-bold">

                ✕
            </button>

        </div>
        `
    );
}

function removeConstraint(button) {

    const total =
        document.querySelectorAll(
            ".restriction-row"
        ).length;

    if (total === 1) {

        showModal(
            "Acción no permitida",
            "Debe existir al menos una restricción.",
            "warning"
        );

        return;
    }

    button
        .closest(".restriction-row")
        .remove();
}

function solveGraphical() {

    const rows =
        document.querySelectorAll(
            ".restriction-row"
        );

    // Validar que exista al menos una restricción
    if (rows.length === 0) {

        showModal(
            "Datos incompletos",
            "Debe agregar al menos una restricción.",
            "warning"
        );

        return;
    }

    // Validar función objetivo
    const objectiveX = parseFloat(
        document.getElementById(
            "objectiveX"
        ).value
    );

    const objectiveY = parseFloat(
        document.getElementById(
            "objectiveY"
        ).value
    );

    if (
        isNaN(objectiveX) ||
        isNaN(objectiveY)
    ) {

        showModal(
            "Datos incompletos",
            "Debe ingresar los coeficientes de la función objetivo.",
            "warning"
        );

        return;
    }

    const constraints = [];

    for (const row of rows) {

        const x = parseFloat(
            row.querySelector(
                ".coef-x"
            ).value
        );

        const y = parseFloat(
            row.querySelector(
                ".coef-y"
            ).value
        );

        const value = parseFloat(
            row.querySelector(
                ".value"
            ).value
        );

        const operator =
            row.querySelector(
                ".operator"
            ).value;

        if (
            isNaN(x) ||
            isNaN(y) ||
            isNaN(value)
        ) {

            showModal(
                "Datos incompletos",
                "Todas las restricciones deben estar completas.",
                "warning"
            );

            return;
        }

        if (
            x === 0 &&
            y === 0
        ) {

            showModal(
                "Restricción inválida",
                "Los coeficientes X y Y no pueden ser ambos cero.",
                "error"
            );

            return;
        }

        constraints.push({
            x,
            y,
            operator,
            value
        });
    }

    const payload = {

        type:
            document.getElementById(
                "optimizationType"
            ).value,

        objective: {
            x: objectiveX,
            y: objectiveY
        },

        constraints
    };

    console.log(
        "Payload enviado:",
        payload
    );

    fetch(
        "/api/graphical",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify(
                payload
            )
        }
    )
    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Error al procesar el problema en el servidor."
            );
        }

        return response.json();
    })
    .then(data => {

        console.log(
            "Respuesta backend:",
            data
        );

        if (
            !data.vertices ||
            data.vertices.length === 0
        ) {

            showModal(
                "Sin solución",
                "No se encontró una región factible para las restricciones ingresadas.",
                "warning"
            );

            return;
        }

        drawGraph(data);

        document.getElementById(
            "graphicalResult"
        ).innerHTML = `

            <div class="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">

                <h3 class="text-xl font-bold text-green-700 mb-2">
                    Resultado Óptimo
                </h3>

                <p>
                    <strong>Punto Óptimo:</strong>
                    (${data.optimal_point[0]},
                    ${data.optimal_point[1]})
                </p>

                <p>
                    <strong>Valor Óptimo:</strong>
                    ${data.optimal_value}
                </p>

            </div>
        `;

        showModal(
            "Proceso completado",
            "El método gráfico fue resuelto correctamente.",
            "success"
        );
    })
    .catch(error => {

        console.error(error);

        showModal(
            "Error",
            error.message,
            "error"
        );
    });
}

function drawGraph(data) {

    const datasets = [];

    data.constraints.forEach(linea => {

        datasets.push({

            label: linea.label,

            data: linea.points.map(
                p => ({
                    x: p[0],
                    y: p[1]
                })
            ),

            showLine: true
        });
    });

    datasets.push({

        label: "Factibles",

        data: data.vertices.map(
            p => ({
                x: p[0],
                y: p[1]
            })
        ),

        pointRadius: 6
    });

    datasets.push({

        label: "Óptimo",

        data: [{
            x: data.optimal_point[0],
            y: data.optimal_point[1]
        }],

        pointRadius: 10
    });

    if (graph) {
        graph.destroy();
    }

    graph = new Chart(
        document.getElementById(
            "graphCanvas"
        ),
        {
            type: "scatter",
            data: {
                datasets
            },
            options: {

                responsive: true,

                scales: {

                    x: {
                        title: {
                            display: true,
                            text: "X"
                        }
                    },

                    y: {
                        title: {
                            display: true,
                            text: "Y"
                        }
                    }
                }
            }
        }
    );
}