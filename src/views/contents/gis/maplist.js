/* eslint-disable no-unused-vars */
import XYZ from 'ol/source/XYZ'

// let source_baidu, source_baidusat, source_baidusatlabel;  //定义百度地图原地址
// let source_qq, source_qqdx, source_qqdxlabel, source_qqsat, source_qqsatlabel;  //定义腾讯soso地图源地址
// let source_gaode, source_gaodesat, source_gaodesatlabel;  //定义高德地图源地址
// let source_tiandi, source_tiandisat, source_tiandilabel;  //定义天地图源地址
// let source_geoq_ChinaOnlineCommunity, source_geoq_ChinaOnlineStreetWarm, source_geoq_ChinaOnlineStreetGray, source_geoq_ChinaOnlineStreetPurplishBlue; //定义geoq智图在线地图服务

//********************加载在线腾讯soso电子地图*************************//
let source_qq = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      y = parseInt(Math.pow(2, z)) - 1 - y
      return 'http://rt' + (x % 4) + '.map.gtimg.com/realtimerender?z=' + z + '&x=' + x + '&y=' + y + '&type=vector'
    } else {
      return ''
    }
  }
})

//********************加载在线腾讯soso地形图*************************//
let source_qqdx = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      y = parseInt(Math.pow(2, z)) - 1 - y
      return (
        'http://p' +
        (x % 4) +
        '.map.gtimg.com/demTiles/' +
        z +
        '/' +
        Math.floor(x / 16.0) +
        '/' +
        Math.floor(y / 16.0) +
        '/' +
        x +
        '_' +
        y +
        '.jpg'
      )
    } else {
      return ''
    }
  }
})

let source_qqdxlabel = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      y = parseInt(Math.pow(2, z)) - 1 - y
      return (
        'http://rt' +
        (x % 4) +
        '.map.gtimg.com/tile?z=' +
        z +
        '&x=' +
        x +
        '&y=' +
        y +
        '&type=vector&styleid=3&version=384'
      )
    } else {
      return ''
    }
  }
})

//********************加载在线腾讯soso卫星影像地图*************************//
let source_qqsat = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      y = parseInt(Math.pow(2, z)) - 1 - y
      return (
        'http://p' +
        (x % 4) +
        '.map.gtimg.com/sateTiles/' +
        z +
        '/' +
        Math.floor(x / 16.0) +
        '/' +
        Math.floor(y / 16.0) +
        '/' +
        x +
        '_' +
        y +
        '.jpg'
      )
    } else {
      return ''
    }
  }
})

let source_qqsatlabel = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      y = parseInt(Math.pow(2, z)) - 1 - y
      return 'http://rt' + (x % 4) + '.map.gtimg.com/tile?z=' + z + '&x=' + x + '&y=' + y + '&styleid=2&version=384'
    } else {
      return ''
    }
  }
})
//********************加载在线百度地图*************************//
let source_baidu = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      let zoom = z - 1
      let offsetX = parseInt(Math.pow(2, zoom))
      let offsetY = offsetX - 1
      let numX = x - offsetX,
        numY = -y + offsetY
      let num = ((y + x) % 8) + 1
      return (
        'http://online' +
        num +
        '.map.bdimg.com/tile/?qt=tile&x=' +
        numX +
        '&y=' +
        numY +
        '&z=' +
        z +
        '&styles=pl&scaler=1'
      )
    } else {
      return ''
    }
  }
})

//********************加载在线百度卫星影像地图*************************//
let source_baidusat = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      let zoom = z - 1
      let offsetX = parseInt(Math.pow(2, zoom))
      let offsetY = offsetX - 1
      let numX = x - offsetX,
        numY = -y + offsetY
      let num = ((y + x) % 8) + 1
      return (
        'http://shangetu' + num + '.map.bdimg.com/it/u=x=' + numX + ';y=' + numY + ';z=' + z + ';v=009;type=sate&fm=46'
      )
    } else {
      return ''
    }
  }
})

let source_baidusatlabel = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      let zoom = z - 1
      let offsetX = parseInt(Math.pow(2, zoom))
      let offsetY = offsetX - 1
      let numX = x - offsetX,
        numY = -y + offsetY
      let num = ((y + x) % 8) + 1
      return 'http://online' + num + '.map.bdimg.com/tile/?qt=tile&x=' + numX + '&y=' + numY + '&z=' + z + '&styles=sl'
    } else {
      return ''
    }
  }
})

//********************加载在线高德地图*************************//
let source_gaode = new XYZ({
  url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
})

//********************加载在线高德卫星影像地图*************************//
let source_gaodesat = new XYZ({
  url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}'
})

let source_gaodesatlabel = new XYZ({
  url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
})

//********************加载在线天地图*************************//
let source_tiandi = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      return (
        'https://t0.tianditu.gov.cn/DataServer?tk=5730f1a9e7de7c8f39c7e45725b863da&T=vec_w&x=' +
        x +
        '&y=' +
        y +
        '&l=' +
        z
      )
    } else {
      return ''
    }
  }
})

//********************加载在线天地卫星影像地图*************************//
let source_tiandisat = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      return (
        'https://t0.tianditu.gov.cn/DataServer?tk=5730f1a9e7de7c8f39c7e45725b863da&T=img_w&x=' +
        x +
        '&y=' +
        y +
        '&l=' +
        z
      )
    } else {
      return ''
    }
  }
})

//天地图labels图层,天地图所有图层都要用
let source_tdtlabeldz = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      return (
        'https://t0.tianditu.gov.cn/DataServer?tk=5730f1a9e7de7c8f39c7e45725b863da&T=cva_w&x=' +
        x +
        '&y=' +
        y +
        '&l=' +
        z
      )
    } else {
      return ''
    }
  }
})
let source_tdtlabelwx = new XYZ({
  tileUrlFunction: function (tileCoord) {
    if (tileCoord) {
      let z = tileCoord[0]
      let x = tileCoord[1]
      let y = -tileCoord[2] - 1
      return (
        'https://t0.tianditu.gov.cn/DataServer?tk=5730f1a9e7de7c8f39c7e45725b863da&T=cia_w&x=' +
        x +
        '&y=' +
        y +
        '&l=' +
        z
      )
    } else {
      return ''
    }
  }
})

//********************geoq智图在线地图服务*************************//
let source_geoq_ChinaOnlineCommunity = new XYZ({
  url: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}'
})
let source_geoq_ChinaOnlineStreetGray = new XYZ({
  url: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}'
})
let source_geoq_ChinaOnlineStreetWarm = new XYZ({
  url: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}'
})
let source_geoq_ChinaOnlineStreetPurplishBlue = new XYZ({
  url: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
})

let mapLabel = [
  {
    label: '在线天地图',
    options: [
      {
        value: 'tdtdz',
        label: '天地图电子地图'
      },
      {
        value: 'tdtwx',
        label: '天地图卫星图'
      }
    ]
  },
  {
    label: '在线百度地图',
    options: [
      {
        value: 'baidudz',
        label: '百度电子地图'
      },
      {
        value: 'baiduwx',
        label: '百度卫星图'
      }
    ]
  },
  {
    label: '在线高德地图',
    options: [
      {
        value: 'gaodedz',
        label: '高德电子地图'
      },
      {
        value: 'gaodewx',
        label: '高德卫星图'
      }
    ]
  },
  {
    label: '在线腾讯地图',
    options: [
      {
        value: 'qqmapdz',
        label: '腾讯电子地图'
      },
      {
        value: 'qqmapdx',
        label: '腾讯地形图'
      },
      {
        value: 'qqmapwx',
        label: '腾讯卫星图'
      }
    ]
  },
  {
    label: '智图在线地图（ArcGIS REST）',
    options: [
      {
        value: 'geoqcs',
        label: '彩色地图'
      },
      {
        value: 'geoqns',
        label: '暖色地图'
      },
      {
        value: 'geoqhs',
        label: '灰色地图'
      },
      {
        value: 'geoqlh',
        label: '蓝黑地图'
      }
    ]
  }
]

let maplist = {
  basemapLabel: mapLabel,
  tdtdz: source_tiandi,
  tdtlabeldz: source_tdtlabeldz,
  tdtwx: source_tiandisat,
  tdtlabelwx: source_tdtlabelwx,
  baidudz: source_baidu,
  baiduwx: source_baidusat,
  baidulabelwx: source_baidusatlabel,
  gaodedz: source_gaode,
  gaodewx: source_gaodesat,
  gaodelabelwx: source_gaodesatlabel,
  qqmapdz: source_qq,
  qqmapdx: source_qqdx,
  qqmaplabledx: source_qqdxlabel,
  qqmapwx: source_qqsat,
  qqmaplablewx: source_qqsatlabel,
  geoqcs: source_geoq_ChinaOnlineCommunity,
  geoqns: source_geoq_ChinaOnlineStreetWarm,
  geoqhs: source_geoq_ChinaOnlineStreetGray,
  geoqlh: source_geoq_ChinaOnlineStreetPurplishBlue
}
export default maplist
