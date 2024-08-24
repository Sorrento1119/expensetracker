        let incomes = [];
        let expenses = [];
        let balance = 0;
        let chart;

        function addIncome() {
            const amount = parseFloat(document.getElementById('incomeAmount').value);
            const description = document.getElementById('incomeDescription').value || 'Income';
            if (amount) {
                incomes.push({ amount, description, date: new Date() });
                updateBalance();
                updateIncomeList();
                updateHistory();
                updateChart();
                document.getElementById('incomeAmount').value = '';
                document.getElementById('incomeDescription').value = '';
            }
        }

        function addExpense() {
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const description = document.getElementById('expenseDescription').value || 'Expense';
            const tag = document.getElementById('expenseTag').value;
            if (amount) {
                expenses.push({ amount, description, tag, date: new Date() });
                updateBalance();
                updateExpenseList();
                updateChart();
                updateHistory();
                document.getElementById('expenseAmount').value = '';
                document.getElementById('expenseDescription').value = '';
            }
        }

        function updateBalance() {
            balance = incomes.reduce((sum, income) => sum + income.amount, 0) -
                      expenses.reduce((sum, expense) => sum + expense.amount, 0);
            document.getElementById('balance').textContent = balance.toFixed(2);
        }

        function updateIncomeList() {
            const incomeList = document.getElementById('incomeList');
            incomeList.innerHTML = '';
            incomes.forEach((income, index) => {
                const li = document.createElement('li');
                li.textContent = `₹${income.amount.toFixed(2)} - ${income.description}`;
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.className = 'delete-btn';
                deleteBtn.onclick = () => deleteIncome(index);
                li.appendChild(deleteBtn);
                incomeList.appendChild(li);
            });
        }

        function updateExpenseList() {
            const expenseList = document.getElementById('expenseList');
            expenseList.innerHTML = '';
            expenses.forEach((expense, index) => {
                const li = document.createElement('li');
                li.textContent = `₹${expense.amount.toFixed(2)} - ${expense.description} (${expense.tag})`;
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.className = 'delete-btn';
                deleteBtn.onclick = () => deleteExpense(index);
                li.appendChild(deleteBtn);
                expenseList.appendChild(li);
            });
        }

        function deleteIncome(index) {
            incomes.splice(index, 1);
            updateBalance();
            updateIncomeList();
            updateHistory();
            updateChart();
        }

        function deleteExpense(index) {
            expenses.splice(index, 1);
            updateBalance();
            updateExpenseList();
            updateChart();
            updateHistory();
        }

        function updateChart() {
            const ctx = document.getElementById('expenseChart').getContext('2d');
            const expensesByTag = {};
            const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            
            expenses.forEach(expense => {
                expensesByTag[expense.tag] = (expensesByTag[expense.tag] || 0) + expense.amount;
            });

            // Add balance to the chart if it's positive
            if (balance > 0) {
                expensesByTag['Balance'] = balance;
            }

            if (chart) {
                chart.destroy();
            }

            const data = Object.entries(expensesByTag).map(([label, value]) => ({
                label,
                value,
                percentage: ((value / (totalExpenses + (balance > 0 ? balance : 0))) * 100).toFixed(1)
            }));

            chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.map(item => `${item.label} (${item.percentage}%)`),
                    datasets: [{
                        data: data.map(item => item.value),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    return `${label}: ₹${value.toFixed(2)}`;
                                }
                            }
                        }
                    }
                }
            });
        }

        function updateHistory() {
            const history = document.getElementById('history');
            history.innerHTML = '';
            const allTransactions = [...incomes.map(i => ({...i, type: 'income'})), 
                                     ...expenses.map(e => ({...e, type: 'expense'}))]
                                    .sort((a, b) => b.date - a.date);
            
            allTransactions.forEach(transaction => {
                const div = document.createElement('div');
                div.className = 'history-item';
                const date = transaction.date.toLocaleDateString();
                const time = transaction.date.toLocaleTimeString();
                const amountClass = transaction.type === 'income' ? 'income' : 'expense';
                const sign = transaction.type === 'income' ? '+' : '-';
                div.innerHTML = `
                    <div>${date} ${time}</div>
                    <div class="${amountClass}">${sign}₹${transaction.amount.toFixed(2)}</div>
                    <div>${transaction.description}</div>
                    ${transaction.type === 'expense' ? `<div>Tag: ${transaction.tag}</div>` : ''}
                `;
                history.appendChild(div);
            });
        }

        // Initialize the chart
        updateChart();