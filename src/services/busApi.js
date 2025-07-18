// 巴士API服務
const API_BASE_URLS = {
  KMB: 'https://data.etabus.gov.hk/v1/transport/kmb',
  CTB: 'https://rt.data.gov.hk/v2/transport/citybus'
}

// 獲取九龍巴士路線列表
export async function getKMBRoutes() {
  try {
    const response = await fetch(`${API_BASE_URLS.KMB}/route`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching KMB routes:', error)
    return []
  }
}

// 獲取城巴路線列表
export async function getCTBRoutes() {
  try {
    const response = await fetch(`${API_BASE_URLS.CTB}/route/ctb`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching CTB routes:', error)
    return []
  }
}

// 獲取九龍巴士站點列表
export async function getKMBStops() {
  try {
    const response = await fetch(`${API_BASE_URLS.KMB}/stop`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching KMB stops:', error)
    return []
  }
}

// 獲取城巴站點列表
export async function getCTBStops() {
  try {
    const response = await fetch(`${API_BASE_URLS.CTB}/stop/ctb`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching CTB stops:', error)
    return []
  }
}

// 獲取九龍巴士路線-站點關係
export async function getKMBRouteStops(route, direction, serviceType) {
  try {
    const response = await fetch(`${API_BASE_URLS.KMB}/route-stop/${route}/${direction}/${serviceType}`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching KMB route stops:', error)
    return []
  }
}

// 獲取城巴路線-站點關係
export async function getCTBRouteStops(route, direction) {
  try {
    const response = await fetch(`${API_BASE_URLS.CTB}/route-stop/ctb/${route}/${direction}`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching CTB route stops:', error)
    return []
  }
}

// 獲取九龍巴士ETA
export async function getKMBETA(stopId, route, serviceType) {
  try {
    const response = await fetch(`${API_BASE_URLS.KMB}/eta/${stopId}/${route}/${serviceType}`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching KMB ETA:', error)
    return []
  }
}

// 獲取城巴ETA
export async function getCTBETA(stopId, route) {
  try {
    const response = await fetch(`${API_BASE_URLS.CTB}/eta/ctb/${stopId}/${route}`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching CTB ETA:', error)
    return []
  }
}

// 搜尋路線
export async function searchRoutes(query) {
  try {
    const [kmbRoutes, ctbRoutes] = await Promise.all([
      getKMBRoutes(),
      getCTBRoutes()
    ])
    
    const filteredKMB = kmbRoutes.filter(route => 
      route.route.toLowerCase().includes(query.toLowerCase())
    ).map(route => ({
      ...route,
      company: 'KMB'
    }))
    
    const filteredCTB = ctbRoutes.filter(route => 
      route.route.toLowerCase().includes(query.toLowerCase())
    ).map(route => ({
      ...route,
      company: 'CTB'
    }))
    
    return [...filteredKMB, ...filteredCTB]
  } catch (error) {
    console.error('Error searching routes:', error)
    return []
  }
}

// 獲取路線的ETA數據
export async function getRouteETA(route, company) {
  try {
    let routeStops = []
    let etaPromises = []
    
    if (company === 'KMB') {
      // 獲取九龍巴士路線站點
      const directions = ['O', 'I'] // 出站和入站
      for (const direction of directions) {
        const stops = await getKMBRouteStops(route, direction, 1)
        routeStops = [...routeStops, ...stops]
      }
      
      // 獲取每個站點的ETA
      etaPromises = routeStops.map(async (stop) => {
        const eta = await getKMBETA(stop.stop, route, 1)
        return {
          ...stop,
          eta: eta
        }
      })
    } else if (company === 'CTB') {
      // 獲取城巴路線站點
      const directions = ['outbound', 'inbound']
      for (const direction of directions) {
        const stops = await getCTBRouteStops(route, direction)
        routeStops = [...routeStops, ...stops]
      }
      
      // 獲取每個站點的ETA
      etaPromises = routeStops.map(async (stop) => {
        const eta = await getCTBETA(stop.stop, route)
        return {
          ...stop,
          eta: eta
        }
      })
    }
    
    const results = await Promise.all(etaPromises)
    return results.filter(result => result.eta && result.eta.length > 0)
  } catch (error) {
    console.error('Error getting route ETA:', error)
    return []
  }
}

// 格式化ETA時間
export function formatETA(etaString) {
  if (!etaString) return '未有班次'
  
  const etaTime = new Date(etaString)
  const now = new Date()
  const diffMinutes = Math.round((etaTime - now) / (1000 * 60))
  
  if (diffMinutes <= 0) return '即將到達'
  if (diffMinutes === 1) return '1分鐘'
  return `${diffMinutes}分鐘`
}

// 獲取站點名稱
export async function getStopName(stopId, company) {
  try {
    if (company === 'KMB') {
      const response = await fetch(`${API_BASE_URLS.KMB}/stop/${stopId}`)
      const data = await response.json()
      return data.data?.name_tc || '未知站點'
    } else if (company === 'CTB') {
      const response = await fetch(`${API_BASE_URLS.CTB}/stop/${stopId}`)
      const data = await response.json()
      return data.data?.name_tc || '未知站點'
    }
  } catch (error) {
    console.error('Error getting stop name:', error)
    return '未知站點'
  }
}

