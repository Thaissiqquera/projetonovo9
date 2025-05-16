
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('nav.tabs button');
  const sections = document.querySelectorAll('.section');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.section).classList.add('active');
    });
  });
  tabs[0].click();
  renderClusters();
  renderCampanhas();
  renderCLV();
  renderRegressao();
});

async function fetchJson(file) {
  const res = await fetch('/' + file);
  if (!res.ok) throw new Error('Erro ' + res.status);
  return res.json();
}

async function renderClusters() {
  const data = await fetchJson('cluster_points.json');
  const diag = await fetchJson('cluster_diagnostico.json');
  new Chart(document.getElementById('clusterChart'), {
    type: 'scatter',
    data: { datasets: [{ label:'Clusters', data: data.map(d=>({x:d.pca1,y:d.pca2})),
      backgroundColor: data.map(d=>['#1cc88a','#36b9cc','#4e73df'][d.cluster]) }] },
    options: { responsive:true, plugins:{legend:{display:false}}, scales:{x:{title:{display:true,text:'PCA 1'}},y:{title:{display:true,text:'PCA 2'}}} }
  });
  new Chart(document.getElementById('clusterDiagChart'), {
    type: 'bar',
    data: {
      labels: diag.map(d=>'Cluster '+d.cluster),
      datasets: [
        { label:'Freq Compras', data:diag.map(d=>d.frequencia_compras), backgroundColor:'#1cc88a' },
        { label:'Total Gasto', data:diag.map(d=>d.total_gasto), backgroundColor:'#36b9cc' },
        { label:'Última Compra', data:diag.map(d=>d.ultima_compra), backgroundColor:'#4e73df' }
      ]
    },
    options: { responsive:true, scales:{y:{beginAtZero:true}} }
  });
}

async function renderCampanhas() {
  const data = await fetchJson('preferencias_campanhas.json');
  new Chart(document.getElementById('campanhaChart'), {
    type: 'bar',
    data: {
      labels: data.map(d=>d.campanha),
      datasets: [
        { label:'Gasto Médio/Cliente', data:data.map(d=>d.gasto_medio_por_cliente), backgroundColor:'#f6c23e' },
        { label:'ROI', data:data.map(d=>d.roi_estimado), backgroundColor:'#e74a3b' }
      ]
    },
    options: { responsive:true, scales:{y:{beginAtZero:true}}, plugins:{tooltip:{mode:'index',intersect:false}} }
  });
  const container = document.getElementById('suggestions');
  data.forEach(d => {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    let text = '';
    if (d.roi_estimado < 1) text = 'ROI abaixo de 1: reavalie custo e segmentação.';
    else if (d.roi_estimado < 1.5) text = 'ROI moderado: otimize canais e criativos.';
    else text = 'ROI alto: considere reinvestir mais.';
    card.innerHTML = `<h3>${d.campanha}</h3><p>${text}</p>`;
    container.appendChild(card);
  });
}

async function renderCLV() {
  const data = await fetchJson('clv_segments.json');
  new Chart(document.getElementById('clvChart'), {
    type: 'pie',
    data: { labels: data.map(d=>d.segmento_valor||'Outros'), datasets:[{ data:data.map(d=>d.count), backgroundColor:['#4e73df','#1cc88a','#36b9cc','#f6c23e'] }] },
    options: { responsive:true, plugins:{legend:{position:'right'}} }
  });
}

async function renderRegressao() {
  const data = await fetchJson('regression_coeffs.json');
  new Chart(document.getElementById('regressionChart'), {
    type:'bar',
    data:{ labels:data.map(d=>d.variable), datasets:[{ label:'Coeficiente', data:data.map(d=>d.coefficient), backgroundColor:'#858796' }] },
    options:{ responsive:true }
  });
  const tbody = document.querySelector('#regressionTable tbody');
  data.forEach(d => {
    const tr = tbody.insertRow();
    tr.insertCell().textContent = d.variable;
    tr.insertCell().textContent = d.coefficient.toFixed(2);
  });
}

// Vercel config will be in vercel.json
