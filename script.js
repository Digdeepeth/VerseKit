let assets = [
  { 
    id: 1, 
    title: "Verse Primary Logo", 
    category: "logo", 
    type: "PNG + SVG", 
    size: "2.4 MB", 
    img: "https://picsum.photos/id/237/800/600" 
  },
  { 
    id: 2, 
    title: "Verse Dark Logo Pack", 
    category: "logo", 
    type: "PNG + SVG", 
    size: "4.1 MB", 
    img: "https://picsum.photos/id/201/800/600" 
  },
  { 
    id: 3, 
    title: "Twitter Header Template", 
    category: "banner", 
    type: "PNG", 
    size: "12 MB", 
    img: "https://picsum.photos/id/180/800/600" 
  },
];

let currentFile = null;

// Render Assets
function renderAssets(filteredAssets) {
  const grid = document.getElementById('assetGrid');
  grid.innerHTML = '';

  filteredAssets.forEach(asset => {
    const card = document.createElement('div');
    card.className = 'asset-card';
    card.innerHTML = `
      <img src="${asset.img}" alt="${asset.title}">
      <div class="p-6">
        <h3 class="font-semibold text-white text-lg mb-1">${asset.title}</h3>
        <p class="text-xs text-emerald-400 uppercase tracking-wider">${asset.category}</p>
        <p class="text-sm text-gray-400 mt-4">${asset.type} • ${asset.size}</p>
        
        <button onclick="downloadAsset('${asset.title}', '${asset.img}')" 
                class="mt-6 w-full py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <i class="fas fa-download"></i> 
          Download
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Download Asset
function downloadAsset(filename, imageUrl) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename.replace(/\s+/g, '-') + '.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Upload Modal Functions
function showUploadModal() {
  document.getElementById('uploadModal').classList.remove('hidden');
  resetModal();
}

function hideUploadModal() {
  document.getElementById('uploadModal').classList.add('hidden');
  resetModal();
}

function resetModal() {
  currentFile = null;
  document.getElementById('previewArea').classList.add('hidden');
  document.getElementById('progressContainer').classList.add('hidden');
  document.getElementById('uploadBtn').disabled = false;
}

// File Handling
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = '#10b981';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.borderColor = '#4b5563';
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = '#4b5563';
  handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
  if (files.length > 0) {
    currentFile = files[0];
    document.getElementById('fileName').textContent = currentFile.name;
    document.getElementById('previewArea').classList.remove('hidden');

    if (currentFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('previewImage').src = e.target.result;
      };
      reader.readAsDataURL(currentFile);
    }
  }
}

// Start Upload
function startUpload() {
  if (!currentFile) {
    alert("Please select a file first!");
    return;
  }

  const uploadBtn = document.getElementById('uploadBtn');
  const progressContainer = document.getElementById('progressContainer');
  
  uploadBtn.disabled = true;
  progressContainer.classList.remove('hidden');

  let progress = 0;
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  const interval = setInterval(() => {
    progress += Math.random() * 25;
    if (progress > 100) progress = 100;

    progressBar.style.width = progress + '%';
    progressText.textContent = `Uploading... ${Math.round(progress)}%`;

    if (progress >= 100) {
      clearInterval(interval);
      finishUpload();
    }
  }, 250);
}

function finishUpload() {
  const newAsset = {
    id: Date.now(),
    title: currentFile.name.split('.')[0] || "New Asset",
    category: "banner",
    type: currentFile.name.split('.').pop().toUpperCase(),
    size: (currentFile.size / (1024 * 1024)).toFixed(1) + " MB",
    img: currentFile.type.startsWith('image/') ? URL.createObjectURL(currentFile) : "https://picsum.photos/id/180/800/600"
  };

  assets.unshift(newAsset);
  renderAssets(assets);

  setTimeout(() => {
    alert("✅ Asset uploaded successfully!");
    hideUploadModal();
  }, 500);
}

// Filter Assets
function filterAssets() {
  const term = document.getElementById('searchInput').value.toLowerCase().trim();
  const cat = document.getElementById('categoryFilter').value;

  const filtered = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(term);
    const matchesCategory = !cat || asset.category === cat;
    return matchesSearch && matchesCategory;
  });

  renderAssets(filtered);
}

// Event Listeners
document.getElementById('searchInput').addEventListener('input', filterAssets);
document.getElementById('categoryFilter').addEventListener('change', filterAssets);

// Initial Render
renderAssets(assets);
