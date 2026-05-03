let assets = [
  { id: 1, title: "Verse Primary Logo", category: "logo", type: "PNG + SVG", size: "2.4 MB", img: "https://picsum.photos/id/237/800/600" },
  { id: 2, title: "Verse Dark Logo Pack", category: "logo", type: "PNG + SVG", size: "4.1 MB", img: "https://picsum.photos/id/201/800/600" },
  { id: 3, title: "Twitter Header Template", category: "banner", type: "PNG", size: "12 MB", img: "https://picsum.photos/id/180/800/600" },
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
      <img src="${asset.img}" class="w-full h-52 object-cover">
      <div class="p-6">
        <h3 class="font-semibold text-white text-lg mb-1">${asset.title}</h3>
        <p class="text-xs text-emerald-400 uppercase">${asset.category}</p>
        <p class="text-sm text-gray-400 mt-4">${asset.type} • ${asset.size}</p>
        
        <button onclick="downloadAsset('${asset.title}', '${asset.img}')" 
                class="mt-6 w-full py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <i class="fas fa-download"></i> Download
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Download Function
function downloadAsset(filename, imageUrl) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename.replace(/\s+/g, '-') + '.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Rest of the upload logic (showUploadModal, startUpload, etc.) remains the same as previous version.

document.getElementById('searchInput').addEventListener('input', filterAssets);
document.getElementById('categoryFilter').addEventListener('change', filterAssets);

renderAssets(assets);
