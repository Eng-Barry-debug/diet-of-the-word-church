<?php
require_once __DIR__ . '/api/config/env.php';
$apiKey = YOUTUBE_API_KEY;
$channelId = 'UCQs4pC8ZkOYExChGIoQ34lQ';
$maxResults = 9;
// Fetch playlists
$playlists = [];
$playlistError = null;
$playlistApiUrl = "https://www.googleapis.com/youtube/v3/playlists?key=$apiKey&channelId=$channelId&part=snippet&maxResults=25";
$playlistResponse = @file_get_contents($playlistApiUrl);
if ($playlistResponse !== false) {
    $playlistData = json_decode($playlistResponse);
    if (!empty($playlistData->items)) {
        foreach ($playlistData->items as $pl) {
            $playlists[] = [
                'id' => $pl->id,
                'title' => $pl->snippet->title
            ];
        }
    }
} else {
    $playlistError = 'Could not fetch playlists.';
}
// Fetch videos (default: channel, or playlist if selected)
$videos = [];
$error = null;
$nextPageToken = '';
$selectedPlaylist = isset($_GET['playlist']) ? $_GET['playlist'] : '';
if ($selectedPlaylist) {
    $apiUrl = "https://www.googleapis.com/youtube/v3/playlistItems?key=$apiKey&playlistId=$selectedPlaylist&part=snippet&maxResults=$maxResults";
} else {
    $apiUrl = "https://www.googleapis.com/youtube/v3/search?key=$apiKey&channelId=$channelId&part=snippet,id&order=date&maxResults=$maxResults";
}
$response = @file_get_contents($apiUrl);
if ($response === false) {
    $error = 'Could not fetch YouTube videos. Please check your API key and channel ID.';
} else {
    $data = json_decode($response);
    if (!empty($data->items)) {
        foreach ($data->items as $item) {
            $snippet = isset($item->snippet) ? $item->snippet : null;
            if ($selectedPlaylist) {
                $videoId = isset($snippet->resourceId->videoId) ? $snippet->resourceId->videoId : null;
            } else {
                $videoId = isset($item->id->videoId) ? $item->id->videoId : null;
            }
            if ($videoId && $snippet) {
                $videos[] = [
                    'title' => $snippet->title,
                    'videoId' => $videoId,
                    'thumbnail' => $snippet->thumbnails->high->url,
                    'publishedAt' => $snippet->publishedAt,
                    'description' => $snippet->description,
                ];
            }
        }
        $nextPageToken = isset($data->nextPageToken) ? $data->nextPageToken : '';
    } else {
        $error = 'No videos found or API limit reached.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sermons | Diet of the Word International Church</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="assets/css/custom.css" rel="stylesheet">
  <style>
    .modal-bg { background: rgba(30, 41, 59, 0.85); }
    .modal { animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.98);} to { opacity: 1; transform: scale(1);} }
    .video-thumb:hover { box-shadow: 0 8px 32px 0 #a78bfa55; transform: scale(1.03); }
    .badge-new { background: linear-gradient(90deg, #f472b6 0%, #a78bfa 100%); color: #fff; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 9999px; position: absolute; top: 0.75rem; left: 0.75rem; }
    .playlist-btn.active, .playlist-btn:hover { background: linear-gradient(90deg, #a78bfa 0%, #f472b6 100%); color: #fff; }
  </style>
</head>
<body class="bg-white text-black">
  <div id="header"></div>
  <script>
    fetch('components/header.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('header').innerHTML = data;
        // --- Dropdown and mobile menu logic ---
        // Mobile menu open/close logic
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        function openMobileMenu() {
          mobileMenu.classList.remove('translate-x-full', 'opacity-0');
          mobileMenu.classList.add('translate-x-0', 'opacity-100');
          mobileOverlay.classList.remove('hidden', 'opacity-0');
          mobileOverlay.classList.add('block', 'opacity-100');
          mobileMenuBtn.setAttribute('aria-expanded', 'true');
        }
        function closeMobileMenu() {
          mobileMenu.classList.add('translate-x-full', 'opacity-0');
          mobileMenu.classList.remove('translate-x-0', 'opacity-100');
          mobileOverlay.classList.add('hidden', 'opacity-0');
          mobileOverlay.classList.remove('block', 'opacity-100');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
        if (mobileMenuBtn && mobileMenu && mobileOverlay && mobileMenuClose) {
          mobileMenuBtn.addEventListener('click', openMobileMenu);
          mobileMenuClose.addEventListener('click', closeMobileMenu);
          mobileOverlay.addEventListener('click', closeMobileMenu);
        }
        // Ministries dropdown: open on hover or click, close on outside click
        const ministriesDropdown = document.getElementById('ministries-dropdown');
        const ministriesLink = document.getElementById('ministries-link');
        const ministriesMenu = document.getElementById('ministries-menu');
        let ministriesOpen = false;
        if (ministriesDropdown && ministriesLink && ministriesMenu) {
          function openDropdown() {
            ministriesMenu.classList.add('opacity-100', 'pointer-events-auto');
            ministriesMenu.classList.remove('opacity-0', 'pointer-events-none');
            ministriesOpen = true;
          }
          function closeDropdown() {
            ministriesMenu.classList.remove('opacity-100', 'pointer-events-auto');
            ministriesMenu.classList.add('opacity-0', 'pointer-events-none');
            ministriesOpen = false;
          }
          ministriesDropdown.addEventListener('mouseenter', openDropdown);
          ministriesDropdown.addEventListener('mouseleave', closeDropdown);
          ministriesLink.addEventListener('click', function(e) {
            e.preventDefault();
            ministriesOpen ? closeDropdown() : openDropdown();
          });
          document.addEventListener('click', function(e) {
            if (!ministriesDropdown.contains(e.target)) {
              closeDropdown();
            }
          });
        }
      });
  </script>
  <section class="bg-gradient-to-br from-blue-800 via-purple-700 to-pink-600 min-h-[40vh] flex items-center justify-center text-center">
    <div class="py-16 px-4">
      <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-4">Sermons</h1>
      <p class="text-lg text-blue-100 max-w-2xl mx-auto">Watch our latest sermons and messages from our YouTube channel. Be inspired and grow in faith with us!</p>
    </div>
  </section>
  <main class="container mx-auto px-4 py-12 min-h-screen">
    <div class="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <input id="searchInput" type="text" placeholder="Search sermons by title or date..." class="w-full sm:w-1/2 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white placeholder-gray-400 transition-all duration-300" />
    </div>
    <?php if (!empty($playlists)): ?>
      <div class="mb-8 flex flex-wrap gap-2 items-center">
        <a href="sermons.php" class="playlist-btn px-4 py-2 rounded-full border border-purple-200 font-semibold transition <?php if (!$selectedPlaylist) echo 'active'; ?>">All Series</a>
        <?php foreach ($playlists as $pl): ?>
          <a href="sermons.php?playlist=<?= htmlspecialchars($pl['id']) ?>" class="playlist-btn px-4 py-2 rounded-full border border-purple-200 font-semibold transition <?php if ($selectedPlaylist === $pl['id']) echo 'active'; ?>"><?= htmlspecialchars($pl['title']) ?></a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
    <?php if ($playlistError): ?>
      <div class="bg-red-100 text-red-700 p-4 rounded mb-8">Error: <?= htmlspecialchars($playlistError) ?></div>
    <?php endif; ?>
    <?php if ($error): ?>
      <div class="bg-red-100 text-red-700 p-4 rounded mb-8">Error: <?= htmlspecialchars($error) ?></div>
    <?php elseif (empty($videos)): ?>
      <div class="text-center text-gray-500 text-xl py-20">No videos found.</div>
    <?php else: ?>
      <div id="sermonGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <?php foreach (
          $videos as $video): ?>
          <?php
            $isNew = (strtotime($video['publishedAt']) > strtotime('-14 days'));
          ?>
          <div class="relative bg-white rounded-2xl shadow-xl p-0 flex flex-col video-thumb transition-transform duration-200">
            <?php if ($isNew): ?><span class="badge-new">New</span><?php endif; ?>
            <div class="w-full aspect-w-16 aspect-h-9">
              <iframe src="https://www.youtube.com/embed/<?= htmlspecialchars($video['videoId']) ?>" frameborder="0" allowfullscreen class="rounded-t-2xl w-full h-56 object-cover"></iframe>
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <h2 class="text-lg font-bold text-blue-900 mb-1 line-clamp-2 cursor-pointer" onclick="openModal('<?= htmlspecialchars($video['videoId']) ?>', <?= htmlspecialchars(json_encode($video['title'])) ?>, <?= htmlspecialchars(json_encode($video['description'])) ?>, '<?= date('F j, Y', strtotime($video['publishedAt'])) ?>')"><?= htmlspecialchars($video['title']) ?></h2>
              <div class="text-xs text-blue-600 mb-2"><?= date('F j, Y', strtotime($video['publishedAt'])) ?></div>
              <p class="text-gray-700 text-sm line-clamp-2 mb-2 cursor-pointer" onclick="openModal('<?= htmlspecialchars($video['videoId']) ?>', <?= htmlspecialchars(json_encode($video['title'])) ?>, <?= htmlspecialchars(json_encode($video['description'])) ?>, '<?= date('F j, Y', strtotime($video['publishedAt'])) ?>')"><?= htmlspecialchars(mb_substr($video['description'], 0, 80)) ?>...</p>
              <button class="mt-auto px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-800 transition text-xs" onclick="openModal('<?= htmlspecialchars($video['videoId']) ?>', <?= htmlspecialchars(json_encode($video['title'])) ?>, <?= htmlspecialchars(json_encode($video['description'])) ?>, '<?= date('F j, Y', strtotime($video['publishedAt'])) ?>')">View Details</button>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
      <?php if ($nextPageToken): ?>
        <div class="flex justify-center mt-8">
          <button id="loadMoreBtn" class="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white font-bold shadow-xl hover:from-pink-600 hover:to-blue-800 transition-all duration-500 text-lg">Load More</button>
        </div>
      <?php endif; ?>
    <?php endif; ?>
    <!-- Video Modal -->
    <div id="videoModal" class="fixed inset-0 z-50 hidden items-center justify-center modal-bg">
      <div class="modal bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6 relative flex flex-col">
        <button onclick="closeModal()" class="absolute top-3 right-3 text-gray-500 hover:text-pink-500 text-2xl font-bold" aria-label="Close Modal">&times;</button>
        <div class="w-full aspect-w-16 aspect-h-9 mb-4">
          <iframe id="modalVideo" width="100%" height="360" src="" frameborder="0" allowfullscreen class="rounded-xl"></iframe>
        </div>
        <h2 id="modalTitle" class="text-2xl font-bold text-blue-900 mb-2"></h2>
        <div id="modalDate" class="text-xs text-blue-600 mb-2"></div>
        <div id="modalDesc" class="text-gray-700 text-sm mb-4"></div>
        <div class="flex gap-4 mt-2">
          <a id="shareWhatsapp" href="#" target="_blank" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.004 2.003a9.994 9.994 0 0 0-8.47 15.47L2 22l4.646-1.53a9.994 9.994 0 1 0 5.358-18.467zm5.6 14.6c-.24.67-1.4 1.3-1.93 1.38-.5.08-1.1.12-1.77-.11-.41-.13-.94-.3-1.62-.59-2.85-1.23-4.7-4.13-4.84-4.33-.14-.2-1.16-1.54-1.16-2.94 0-1.4.74-2.08 1-2.36.26-.28.57-.35.76-.35.19 0 .38.01.54.01.17 0 .4-.06.63.48.24.57.81 1.97.88 2.12.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.54-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12.99 2.07 1.3 2.37 1.45.3.15.47.13.65-.08.18-.21.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.7.8 1.99.94.29.14.48.21.55.33.07.12.07.69-.17 1.36z"/></svg> WhatsApp</a>
          <a id="shareFacebook" href="#" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg> Facebook</a>
          <a id="shareTwitter" href="#" target="_blank" class="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.916 4.916 0 0 0 16.616 3c-2.717 0-4.924 2.206-4.924 4.924 0 .386.044.763.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.724-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg> Twitter</a>
        </div>
      </div>
    </div>
    <script>
      // Video Modal Logic
      function openModal(videoId, title, desc, date) {
        document.getElementById('videoModal').classList.remove('hidden');
        document.getElementById('videoModal').classList.add('flex');
        document.querySelector('#videoModal .modal').classList.add('show');
        document.getElementById('modalVideo').src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalDesc').textContent = desc;
        document.getElementById('modalDate').textContent = date;
        // Social share links
        var url = encodeURIComponent('https://www.youtube.com/watch?v=' + videoId);
        var text = encodeURIComponent(title);
        document.getElementById('shareWhatsapp').href = 'https://wa.me/?text=' + text + '%20' + url;
        document.getElementById('shareFacebook').href = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
        document.getElementById('shareTwitter').href = 'https://twitter.com/intent/tweet?text=' + text + '&url=' + url;
      }
      function closeModal() {
        document.getElementById('videoModal').classList.add('hidden');
        document.getElementById('videoModal').classList.remove('flex');
        document.querySelector('#videoModal .modal').classList.remove('show');
        document.getElementById('modalVideo').src = '';
      }
      // Close modal on background click
      document.getElementById('videoModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
      });
      // Search/filter logic
      document.getElementById('searchInput').addEventListener('input', function() {
        var q = this.value.toLowerCase();
        var cards = document.querySelectorAll('#sermonGrid > div');
        cards.forEach(function(card) {
          var title = card.querySelector('h2').textContent.toLowerCase();
          var date = card.querySelector('.text-xs').textContent.toLowerCase();
          if (title.includes(q) || date.includes(q)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
      // Load More functionality
      <?php if ($nextPageToken): ?>
      let nextPageToken = "<?= $nextPageToken ?>";
      const apiKey = "<?= $apiKey ?>";
      const channelId = "<?= $channelId ?>";
      const maxResults = <?= $maxResults ?>;
      const selectedPlaylist = "<?= $selectedPlaylist ?>";
      document.getElementById('loadMoreBtn').addEventListener('click', function() {
        this.disabled = true;
        this.textContent = 'Loading...';
        let url = selectedPlaylist
          ? `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${selectedPlaylist}&part=snippet&maxResults=${maxResults}&pageToken=${nextPageToken}`
          : `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}&pageToken=${nextPageToken}`;
        fetch(url)
          .then(res => res.json())
          .then(data => {
            if (data.items) {
              data.items.forEach(item => {
                let snippet = item.snippet;
                let videoId = selectedPlaylist
                  ? (snippet.resourceId ? snippet.resourceId.videoId : null)
                  : (item.id && item.id.videoId ? item.id.videoId : null);
                if (videoId && snippet) {
                  const isNew = (new Date(snippet.publishedAt).getTime() > Date.now() - 14*24*60*60*1000);
                  const card = document.createElement('div');
                  card.className = 'relative bg-white rounded-2xl shadow-xl p-0 flex flex-col video-thumb transition-transform duration-200';
                  card.innerHTML = `
                    ${isNew ? '<span class=\'badge-new\'>New</span>' : ''}
                    <div class="w-full aspect-w-16 aspect-h-9">
                      <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="rounded-t-2xl w-full h-56 object-cover"></iframe>
                    </div>
                    <div class="p-4 flex-1 flex flex-col">
                      <h2 class="text-lg font-bold text-blue-900 mb-1 line-clamp-2 cursor-pointer" onclick="openModal('${videoId}', ${JSON.stringify(snippet.title)}, ${JSON.stringify(snippet.description)}, '${new Date(snippet.publishedAt).toLocaleDateString()}')">${snippet.title}</h2>
                      <div class="text-xs text-blue-600 mb-2">${new Date(snippet.publishedAt).toLocaleDateString()}</div>
                      <p class="text-gray-700 text-sm line-clamp-2 mb-2 cursor-pointer" onclick="openModal('${videoId}', ${JSON.stringify(snippet.title)}, ${JSON.stringify(snippet.description)}, '${new Date(snippet.publishedAt).toLocaleDateString()}')">${snippet.description.substring(0, 80)}...</p>
                      <button class="mt-auto px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-800 transition text-xs" onclick="openModal('${videoId}', ${JSON.stringify(snippet.title)}, ${JSON.stringify(snippet.description)}, '${new Date(snippet.publishedAt).toLocaleDateString()}')">View Details</button>
                    </div>
                  `;
                  document.getElementById('sermonGrid').appendChild(card);
                }
              });
              if (data.nextPageToken) {
                nextPageToken = data.nextPageToken;
                document.getElementById('loadMoreBtn').disabled = false;
                document.getElementById('loadMoreBtn').textContent = 'Load More';
              } else {
                document.getElementById('loadMoreBtn').remove();
              }
            }
          });
      });
      <?php endif; ?>
    </script>
  </main>
  <?php include 'components/footer.html'; ?>
</body>
</html> 