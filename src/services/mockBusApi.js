// 模擬巴士API服務 - 用於演示目的
// 由於CORS限制，我們使用模擬數據來展示功能

// 模擬路線數據
const mockRoutes = {
  KMB: [
    { route: '1', bound: 'O', service_type: 1, orig_tc: '竹園邨', dest_tc: '尖沙咀碼頭' },
    { route: '1', bound: 'I', service_type: 1, orig_tc: '尖沙咀碼頭', dest_tc: '竹園邨' },
    { route: '2', bound: 'O', service_type: 1, orig_tc: '蘇屋', dest_tc: '尖沙咀碼頭' },
    { route: '2', bound: 'I', service_type: 1, orig_tc: '尖沙咀碼頭', dest_tc: '蘇屋' },
    { route: '6', bound: 'O', service_type: 1, orig_tc: '荔枝角', dest_tc: '尖沙咀碼頭' },
    { route: '6', bound: 'I', service_type: 1, orig_tc: '尖沙咀碼頭', dest_tc: '荔枝角' },
    { route: '11', bound: 'O', service_type: 1, orig_tc: '九龍站', dest_tc: '鑽石山站' },
    { route: '11', bound: 'I', service_type: 1, orig_tc: '鑽石山站', dest_tc: '九龍站' }
  ],
  CTB: [
    { route: 'A21', bound: 'O', orig_tc: '紅磡站', dest_tc: '機場(地面運輸中心)' },
    { route: 'A21', bound: 'I', orig_tc: '機場(地面運輸中心)', dest_tc: '紅磡站' },
    { route: 'E23', bound: 'O', orig_tc: '慈雲山(北)', dest_tc: '機場(地面運輸中心)' },
    { route: 'E23', bound: 'I', orig_tc: '機場(地面運輸中心)', dest_tc: '慈雲山(北)' }
  ]
}

// 模擬站點數據
const mockStops = {
  '1': [
    { stop: 'KA01-S-1250-0', name_tc: '竹園邨', seq: 1 },
    { stop: 'KA02-S-1300-0', name_tc: '黃大仙站', seq: 2 },
    { stop: 'KA03-S-1350-0', name_tc: '九龍城廣場', seq: 3 },
    { stop: 'KA04-S-1400-0', name_tc: '旺角東站', seq: 4 },
    { stop: 'KA05-S-1450-0', name_tc: '太子站', seq: 5 },
    { stop: 'KA06-S-1500-0', name_tc: '深水埗站', seq: 6 },
    { stop: 'KA07-S-1550-0', name_tc: '長沙灣站', seq: 7 },
    { stop: 'KA08-S-1600-0', name_tc: '尖沙咀碼頭', seq: 8 }
  ],
  '2': [
    { stop: 'KB01-S-2250-0', name_tc: '蘇屋', seq: 1 },
    { stop: 'KB02-S-2300-0', name_tc: '長沙灣', seq: 2 },
    { stop: 'KB03-S-2350-0', name_tc: '深水埗', seq: 3 },
    { stop: 'KB04-S-2400-0', name_tc: '太子', seq: 4 },
    { stop: 'KB05-S-2450-0', name_tc: '旺角', seq: 5 },
    { stop: 'KB06-S-2500-0', name_tc: '油麻地', seq: 6 },
    { stop: 'KB07-S-2550-0', name_tc: '佐敦', seq: 7 },
    { stop: 'KB08-S-2600-0', name_tc: '尖沙咀碼頭', seq: 8 }
  ],
  'A21': [
    { stop: 'CA01-S-3250-0', name_tc: '紅磡站', seq: 1 },
    { stop: 'CA02-S-3300-0', name_tc: '土瓜灣站', seq: 2 },
    { stop: 'CA03-S-3350-0', name_tc: '九龍城', seq: 3 },
    { stop: 'CA04-S-3400-0', name_tc: '九龍灣', seq: 4 },
    { stop: 'CA05-S-3450-0', name_tc: '觀塘', seq: 5 },
    { stop: 'CA06-S-3500-0', name_tc: '藍田', seq: 6 },
    { stop: 'CA07-S-3550-0', name_tc: '將軍澳', seq: 7 },
    { stop: 'CA08-S-3600-0', name_tc: '機場', seq: 8 }
  ]
}

// 生成隨機ETA時間
function generateRandomETA() {
  const now = new Date()
  const randomMinutes = Math.floor(Math.random() * 20) + 1 // 1-20分鐘
  const etaTime = new Date(now.getTime() + randomMinutes * 60000)
  return etaTime.toISOString()
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

// 搜尋路線
export async function searchRoutes(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allRoutes = [
        ...mockRoutes.KMB.map(route => ({ ...route, company: 'KMB' })),
        ...mockRoutes.CTB.map(route => ({ ...route, company: 'CTB' }))
      ]
      
      const filteredRoutes = allRoutes.filter(route => 
        route.route.toLowerCase().includes(query.toLowerCase())
      )
      
      resolve(filteredRoutes)
    }, 500) // 模擬網絡延遲
  })
}

// 獲取路線的ETA數據
export async function getRouteETA(route, company) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stops = mockStops[route] || []
      
      const etaResults = stops.map(stop => ({
        ...stop,
        eta: [
          { eta: generateRandomETA() },
          { eta: generateRandomETA() }
        ]
      }))
      
      resolve(etaResults)
    }, 1000) // 模擬網絡延遲
  })
}

// 獲取站點名稱
export async function getStopName(stopId, company) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 從所有路線的站點中查找
      for (const routeStops of Object.values(mockStops)) {
        const stop = routeStops.find(s => s.stop === stopId)
        if (stop) {
          resolve(stop.name_tc)
          return
        }
      }
      resolve('未知站點')
    }, 200)
  })
}

