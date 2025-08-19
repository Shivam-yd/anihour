<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class AnimeAPI {
    private $baseURL = 'https://api.jikan.moe/v4';
    private $cache = [];
    private $cacheDuration = 300; // 5 minutes

    public function fetchFromJikan($endpoint) {
        $cacheKey = md5($endpoint);
        $cacheFile = "cache_{$cacheKey}.json";
        
        // Check cache
        if (file_exists($cacheFile)) {
            $cacheData = json_decode(file_get_contents($cacheFile), true);
            if (time() - $cacheData['timestamp'] < $this->cacheDuration) {
                return $cacheData['data'];
            }
        }
        
        // Fetch from API
        $url = $this->baseURL . $endpoint;
        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'user_agent' => 'Anihour/1.0'
            ]
        ]);
        
        $response = @file_get_contents($url, false, $context);
        if ($response === false) {
            return ['data' => [], 'error' => 'Failed to fetch data'];
        }
        
        $data = json_decode($response, true);
        
        // Cache the response
        file_put_contents($cacheFile, json_encode([
            'data' => $data,
            'timestamp' => time()
        ]));
        
        return $data;
    }
    
    public function getCurrentSeason() {
        return $this->fetchFromJikan('/seasons/now');
    }
    
    public function getTopAnime() {
        return $this->fetchFromJikan('/top/anime?type=tv&limit=25');
    }
    
    public function getUpcoming() {
        return $this->fetchFromJikan('/seasons/upcoming');
    }
    
    public function getAnimeDetail($id) {
        return $this->fetchFromJikan("/anime/{$id}/full");
    }
    
    public function searchAnime($query) {
        $query = urlencode($query);
        return $this->fetchFromJikan("/anime?q={$query}&limit=20");
    }
}

// Handle different endpoints
$action = $_GET['action'] ?? 'current';
$api = new AnimeAPI();

switch ($action) {
    case 'current':
        echo json_encode($api->getCurrentSeason());
        break;
        
    case 'top':
        echo json_encode($api->getTopAnime());
        break;
        
    case 'upcoming':
        echo json_encode($api->getUpcoming());
        break;
        
    case 'detail':
        $id = intval($_GET['id'] ?? 0);
        if ($id > 0) {
            echo json_encode($api->getAnimeDetail($id));
        } else {
            echo json_encode(['error' => 'Invalid anime ID']);
        }
        break;
        
    case 'search':
        $query = $_GET['q'] ?? '';
        if (!empty($query)) {
            echo json_encode($api->searchAnime($query));
        } else {
            echo json_encode(['error' => 'Search query required']);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
}
?>