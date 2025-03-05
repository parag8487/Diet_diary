document.addEventListener('DOMContentLoaded', function () {
    // Chart configuration
    const ctx = document.getElementById("calorieProteinChart").getContext("2d");
    const chartConfig = {
        type: "bar",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Calories",
                data: [],
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                borderColor: "rgba(255, 99, 132, 1)",
                yAxisID: 'y'
            }, {
                label: "Protein (g)",
                data: [],
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: true, title: { display: true, text: 'Days' } },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Calories' },
                    beginAtZero: true,
                    max: 2500,  // Set the maximum value for the Calories axis
                    stepSize: 500
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'Protein (g)' },
                    beginAtZero: true,
                    grid: { drawOnChartArea: false }
                }
            }
        }
    };

    const calorieProteinChart = new Chart(ctx, chartConfig);

    // Data functions
    async function fetchChartData() {
        try {
            const response = await fetch('http://localhost:3000/get-weekly-data');
            const data = await response.json();
            
            // Ensure Protein is always less than or equal to Calories
            const calorieData = validateData(data.calorieData);
            const proteinData = validateData(data.proteinData).map((protein, index) => {
                // Ensure protein value is not greater than calories for the same day
                return Math.min(protein, calorieData[index]);
            });

            return {
                calorieData: calorieData,
                proteinData: proteinData
            };
        } catch (error) {
            console.error('Fetch error:', error);
            return { calorieData: [], proteinData: [] };
        }
    }

    function validateData(dataArray) {
        return Array.isArray(dataArray) && dataArray.length === 7 
            ? dataArray 
            : [0, 0, 0, 0, 0, 0, 0];
    }

    // Update chart
    function updateChart(data) {
        if (calorieProteinChart) {
            calorieProteinChart.data.datasets[0].data = data.calorieData;
            calorieProteinChart.data.datasets[1].data = data.proteinData;
            calorieProteinChart.update();
        }
    }

    // Refresh functionality
    async function refreshChart() {
        const data = await fetchChartData();
        updateChart(data);
    }

    // Initial load
    refreshChart();

    // Auto-refresh every 30 seconds
    setInterval(refreshChart, 30000);

    // Manual refresh button
    document.getElementById('refreshChart')?.addEventListener('click', refreshChart);
});
