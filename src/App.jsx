import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Search, Bus, Clock, MapPin, RotateCcw, AlertCircle } from 'lucide-react'
import { searchRoutes, getRouteETA, formatETA, getStopName } from './services/mockBusApi.js'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [etaData, setEtaData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [routes, setRoutes] = useState([])

  // 熱門路線數據
  const popularRoutes = [
    { route: '1', company: 'KMB', destination: '尖沙咀碼頭' },
    { route: '2', company: 'KMB', destination: '蘇屋' },
    { route: '6', company: 'KMB', destination: '荔枝角' },
    { route: '11', company: 'KMB', destination: '九龍站' },
    { route: 'A21', company: 'CTB', destination: '機場' },
    { route: 'E23', company: 'CTB', destination: '機場' },
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      // 搜尋路線
      const foundRoutes = await searchRoutes(searchQuery)
      setRoutes(foundRoutes)
      
      if (foundRoutes.length > 0) {
        // 選擇第一個匹配的路線
        const firstRoute = foundRoutes[0]
        setSelectedRoute(firstRoute)
        
        // 獲取ETA數據
        const etaResults = await getRouteETA(firstRoute.route, firstRoute.company)
        
        // 處理ETA數據並獲取站點名稱
        const processedETA = await Promise.all(
          etaResults.slice(0, 10).map(async (stop) => {
            const stopName = await getStopName(stop.stop, firstRoute.company)
            const etaList = stop.eta || []
            
            return {
              stopId: stop.stop,
              stopName: stopName,
              route: firstRoute.route,
              company: firstRoute.company,
              destination: firstRoute.dest_tc || firstRoute.destination,
              eta: etaList.length > 0 ? formatETA(etaList[0].eta) : '未有班次',
              nextEta: etaList.length > 1 ? formatETA(etaList[1].eta) : '未有班次',
              seq: stop.seq || 0
            }
          })
        )
        
        setEtaData(processedETA.sort((a, b) => a.seq - b.seq))
      } else {
        setEtaData([])
        setError('找不到相關路線')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('搜尋時發生錯誤，請稍後再試')
      setEtaData([])
    } finally {
      setLoading(false)
    }
  }

  const handleRouteSelect = async (route) => {
    setSelectedRoute(route)
    setSearchQuery(route.route)
    setLoading(true)
    setError(null)
    
    try {
      // 獲取ETA數據
      const etaResults = await getRouteETA(route.route, route.company)
      
      // 處理ETA數據並獲取站點名稱
      const processedETA = await Promise.all(
        etaResults.slice(0, 10).map(async (stop) => {
          const stopName = await getStopName(stop.stop, route.company)
          const etaList = stop.eta || []
          
          return {
            stopId: stop.stop,
            stopName: stopName,
            route: route.route,
            company: route.company,
            destination: route.destination,
            eta: etaList.length > 0 ? formatETA(etaList[0].eta) : '未有班次',
            nextEta: etaList.length > 1 ? formatETA(etaList[1].eta) : '未有班次',
            seq: stop.seq || 0
          }
        })
      )
      
      setEtaData(processedETA.sort((a, b) => a.seq - b.seq))
    } catch (err) {
      console.error('Route select error:', err)
      setError('獲取路線數據時發生錯誤')
      setEtaData([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Bus className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">香港巴士預報</h1>
              <p className="text-sm text-gray-600">實時巴士到站時間查詢</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              搜尋巴士路線
            </CardTitle>
            <CardDescription>
              輸入巴士路線號碼或選擇熱門路線
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="輸入巴士路線號碼 (例如: 1, A21, E23)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <RotateCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                搜尋
              </Button>
            </div>
            
            {/* Popular Routes */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">熱門路線：</p>
              <div className="flex flex-wrap gap-2">
                {popularRoutes.map((route, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRouteSelect(route)}
                    className="text-xs"
                  >
                    <Badge variant="secondary" className="mr-1 text-xs">
                      {route.company}
                    </Badge>
                    {route.route} → {route.destination}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ETA Results */}
        {etaData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                到站時間預報
                {selectedRoute && (
                  <Badge variant="outline">
                    {selectedRoute.company} {selectedRoute.route}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                實時更新，數據來源：香港政府開放數據平台
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {etaData.map((stop, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium text-gray-900">{stop.stopName}</h3>
                        <p className="text-sm text-gray-600">
                          往 {stop.destination}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={stop.eta === '未有班次' ? 'secondary' : 'default'} 
                          className={stop.eta === '未有班次' ? '' : 'bg-green-600'}
                        >
                          {stop.eta}
                        </Badge>
                        {stop.nextEta !== '未有班次' && (
                          <Badge variant="outline">
                            下班: {stop.nextEta}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {stop.company} {stop.route}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>最後更新: {new Date().toLocaleTimeString('zh-HK')}</span>
                  <Button variant="ghost" size="sm" onClick={handleSearch}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    重新整理
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {etaData.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="text-center py-12">
              <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                開始搜尋巴士路線
              </h3>
              <p className="text-gray-600">
                輸入巴士路線號碼或選擇熱門路線來查看實時到站時間
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="text-center py-12">
              <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                正在載入數據...
              </h3>
              <p className="text-gray-600">
                請稍候，正在獲取最新的巴士到站時間
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>數據來源：香港政府開放數據平台</p>
            <p className="mt-1">支援九龍巴士 (KMB)、龍運巴士 (LWB)、城巴 (CTB) 及新世界第一巴士 (NWFB)</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

