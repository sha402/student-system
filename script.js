// -------------------------------------------------------------
// 1. Data Generator (1000 Students + Exam Marks)
// -------------------------------------------------------------
const firstNames = ["أحمد", "محمد", "محمود", "علي", "عمر", "يوسف", "حسين", "خالد", "عبدالرحمن", "مصطفى", "إبراهيم", "طارق", "زياد", "كريم", "حمزة", "آدم", "سارة", "مريم", "نور", "فاطمة", "آية", "روان", "شهد", "حبيبة", "منة"];
const middleNames = ["عادل", "سعيد", "حسن", "فتحي", "كمال", "فاروق", "سليمان", "توفيق", "رمضان", "شريف", "نبيل", "عزت", "عاطف"];
const lastNames = ["الشافعي", "المصري", "السيوي", "الشرقاوي", "المنياوي", "السيد", "عبدالله", "عثمان", "رضا", "منصور", "زكي", "جابر"];

let students = [];
let currentFilter = 'all';

function generate1000Students() {
  for (let i = 1; i <= 1000; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const mn = middleNames[Math.floor(Math.random() * middleNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${fn} ${mn} ${ln}`;

    // Random Gold & Initial Stats
    let gold = Math.floor(Math.random() * 300) + 50; 
    let isPresent = Math.random() > 0.2; 
    let hwDone = Math.random() > 0.3;

    // Random Exam Marks (Arabic Subject)
    let oral = Math.floor(Math.random() * 6) + 15;   // Out of 20
    let midterm = Math.floor(Math.random() * 11) + 20; // Out of 30
    let final = Math.floor(Math.random() * 16) + 35;   // Out of 50

    students.push({
      id: i,
      name: fullName,
      gold: gold,
      isPresent: isPresent,
      hwDone: hwDone,
      oral: oral,
      midterm: midterm,
      final: final
    });
  }
  sortAndAssignRanks();
}

function sortAndAssignRanks() {
  // Sort students by Gold (descending)
  students.sort((a, b) => b.gold - a.gold);
  
  students.forEach((s, index) => {
    s.rank = index + 1;
  });
}

// -------------------------------------------------------------
// 2. UI Rendering Engine
// -------------------------------------------------------------
function renderTable(data = students) {
  const tbody = document.getElementById('studentTableBody');
  tbody.innerHTML = '';

  // Update Top Rank Champion Card (#1)
  if (students.length > 0) {
    const topStudent = students[0];
    document.getElementById('champ-name').innerText = topStudent.name;
    document.getElementById('champ-gold').innerText = topStudent.gold + 100; // Includes +100 bonus for #1
  }

  data.forEach(student => {
    const tr = document.createElement('tr');

    let rankClass = '';
    if (student.rank === 1) rankClass = 'rank-1';
    else if (student.rank === 2) rankClass = 'rank-2';
    else if (student.rank === 3) rankClass = 'rank-3';

    const displayGold = student.rank === 1 ? student.gold + 100 : student.gold;
    const totalGrade = student.oral + student.midterm + student.final; // Out of 100

    tr.innerHTML = `
      <td><span class="rank-badge ${rankClass}">${student.rank}</span></td>
      <td><strong>${student.name}</strong></td>
      <td>
        <div class="gold-count">
          <i class="fa-solid fa-coins"></i> ${displayGold}
        </div>
      </td>
      <td>
        <input type="number" class="grade-input" value="${student.oral}" max="20" min="0" onchange="updateGrade(${student.id}, 'oral', this.value)"> / 20
      </td>
      <td>
        <input type="number" class="grade-input" value="${student.midterm}" max="30" min="0" onchange="updateGrade(${student.id}, 'midterm', this.value)"> / 30
      </td>
      <td>
        <input type="number" class="grade-input" value="${student.final}" max="50" min="0" onchange="updateGrade(${student.id}, 'final', this.value)"> / 50
      </td>
      <td><span class="total-grade">${totalGrade} / 100</span></td>
      <td>
        <span style="color: ${student.isPresent ? 'var(--accent-green)' : 'var(--accent-red)'}">
          <i class="fa-solid ${student.isPresent ? 'fa-user-check' : 'fa-user-xmark'}"></i>
          ${student.isPresent ? 'حاضر (+30)' : 'غائب (-20)'}
        </span>
      </td>
      <td>
        <span style="color: ${student.hwDone ? 'var(--gold-primary)' : '#888'}">
          <i class="fa-solid ${student.hwDone ? 'fa-check-circle' : 'fa-circle'}"></i>
          ${student.hwDone ? 'تم (+15)' : 'لم يسلم'}
        </span>
      </td>
      <td>
        <button class="btn-action btn-present" title="حضور (+30)" onclick="markAttendance(${student.id}, true)">حضر</button>
        <button class="btn-action btn-absent" title="غياب (-20)" onclick="markAttendance(${student.id}, false)">غاب</button>
        <button class="btn-action btn-hw" title="واجب (+15)" onclick="markHW(${student.id})">واجب</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// -------------------------------------------------------------
// 3. Logic & Event Handlers
// -------------------------------------------------------------
function markAttendance(id, status) {
  const student = students.find(s => s.id === id);
  if (student) {
    if (status && !student.isPresent) {
      student.gold += 50; // Recover 20 penalty + 30 reward
      student.isPresent = true;
    } else if (!status && student.isPresent) {
      student.gold -= 50; // Lose 30 reward + 20 penalty
      student.isPresent = false;
    }
    sortAndAssignRanks();
    applySearchAndFilter();
  }
}

function markHW(id) {
  const student = students.find(s => s.id === id);
  if (student) {
    student.hwDone = !student.hwDone;
    student.gold += student.hwDone ? 15 : -15;
    sortAndAssignRanks();
    applySearchAndFilter();
  }
}

function updateGrade(id, type, value) {
  const student = students.find(s => s.id === id);
  if (student) {
    student[type] = parseInt(value) || 0;
    applySearchAndFilter();
  }
}

function filterStudents(type) {
  currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  applySearchAndFilter();
}

function applySearchAndFilter() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  
  let filtered = students.filter(s => {
    const matchesName = s.name.toLowerCase().includes(query) || s.rank.toString() === query;
    if (currentFilter === 'absent') return matchesName && !s.isPresent;
    if (currentFilter === 'top') return matchesName && s.rank <= 10;
    return matchesName;
  });

  renderTable(filtered);
}

// -------------------------------------------------------------
// 4. Three.js 3D Background Animation
// -------------------------------------------------------------
function init3DAnimation() {
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Floating 3D Cubes
  const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    shininess: 100
  });

  const cubes = [];
  for (let i = 0; i < 70; i++) {
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = (Math.random() - 0.5) * 60;
    cube.position.y = (Math.random() - 0.5) * 60;
    cube.position.z = (Math.random() - 0.5) * 60;
    
    cube.rotation.x = Math.random() * Math.PI;
    cube.rotation.y = Math.random() * Math.PI;

    scene.add(cube);
    cubes.push(cube);
  }

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffd700, 2, 100);
  pointLight.position.set(10, 20, 10);
  scene.add(pointLight);

  // Mouse Interactivity
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);

    cubes.forEach(cube => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.015;
      cube.position.y += Math.sin(Date.now() * 0.001 + cube.position.x) * 0.01;
    });

    camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 10 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Initialize System
window.onload = () => {
  generate1000Students();
  renderTable();
  init3DAnimation();
  
  document.getElementById('searchInput').addEventListener('input', applySearchAndFilter);
};