'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ADLayer = function () {
	function ADLayer(ecOptions, map, echarts) {
		_classCallCheck(this, ADLayer);

		this._map = map;
		this._ecOptions = ecOptions;
		this._registered = false;
		this._container = null;
		this.zIndex = 999;
		this._container = null;
		this._echarts = echarts;
		this.event = null;
	}

	_createClass(ADLayer, [{
		key: 'getMap',
		value: function getMap() {
			return this._map;
		}
	}, {
		key: 'show',
		value: function show() {
			if (this._container) {
				this._container.style.display = '';
			}
		}
	}, {
		key: '_isVisible',
		value: function _isVisible() {
			return this._container && this._container.style.display === '';
		}
	}, {
		key: 'render',
		value: function render() {
			//保证地图渲染完成才执行专题图渲染，且只执行一次
			this._map.once('postrender', this._render.bind(this));
		}
	}, {
		key: '_render',
		value: function _render() {
			if (!this._container) {
				this._createLayerContainer();
			}
			if (!this._ec) {
				this._ec = this._echarts.init(this._container);
				this._prepareECharts();
				this._ec.setOption(this._ecOptions, false);
			} else if (this._isVisible()) {
				this._ec.resize();
			}
			this._bindEvent();
		}
	}, {
		key: '_bindEvent',
		value: function _bindEvent() {
			this.event = this._moveHandler("onMoveEnd");
			this._map.on('postrender', this.event);
			this._map.getView().on('change:resolution', this.event);
		}
	}, {
		key: '_moveHandler',
		value: function _moveHandler(type) {
			var _this = this;

			return _this[type].bind(this);
		}
	}, {
		key: '_prepareECharts',
		value: function _prepareECharts() {
			if (!this._registered) {
				this._echarts.registerCoordinateSystem('openlayers', this._getE3CoordinateSystem(this.getMap()));
				this._registered = true;
			}
			var series = this._ecOptions.series;
			if (series) {
				for (var i = series.length - 1; i >= 0; i--) {
					series[i]['coordinateSystem'] = 'openlayers';

					series[i]['animation'] = false;
				}
			}
		}
	}, {
		key: '_createLayerContainer',
		value: function _createLayerContainer() {
			var size = this._map.getSize();
			var container = this._container = ADLayer.Element.createDiv('e_container', {
				height: size[1] + 'px',
				width: size[0] + 'px',
				top: '0px',
				left: '0px',
				zIndex: 999
			});

			if (this._zIndex) {
				container.style.zIndex = this._zIndex;
			}
			this._resetContainer();
			this._map.getViewport().appendChild(this._container);
		}
	}, {
		key: '_resetContainer',
		value: function _resetContainer() {
			var size = this.getMap().getSize();

			this._container.style.width = size.width + 'px';
			this._container.style.height = size.height + 'px';
		}
	}, {
		key: '_getE3CoordinateSystem',
		value: function _getE3CoordinateSystem(map) {
			var CoordSystem = function CoordSystem(map) {
				this.map = map;
				this._mapOffset = [0, 0];
			};

			CoordSystem.create = function (ecModel) {
				ecModel.eachSeries(function (seriesModel) {
					if (seriesModel.get('coordinateSystem') === 'openlayers') {
						seriesModel.coordinateSystem = new CoordSystem(map);
					}
				});
			};

			CoordSystem.getDimensionsInfo = function () {
				return ['x', 'y'];
			};

			CoordSystem.dimensions = ['x', 'y'];

			CoordSystem.prototype.dimensions = ['x', 'y'];
			CoordSystem.prototype.setMapOffset = function setMapOffset(mapOffset) {
				this._mapOffset = mapOffset;
			};
			CoordSystem.prototype.dataToPoint = function dataToPoint(data) {
				//地理坐标转为屏幕坐标
				//console.log(data);
				var px = this.map.getPixelFromCoordinate(data);
				var mapOffset = this._mapOffset;
				return [px[0] - mapOffset[0], px[1] - mapOffset[1]];
			}, CoordSystem.prototype.pointToData = function pointToData(pt) {
				//屏幕坐标转为地理坐标
				var mapOffset = this._mapOffset;
				var data = this.map.containerPointToCoordinate({
					x: pt[0] + mapOffset[0],
					y: pt[1] + mapOffset[1]
				});
				return [data.x, data.y];
			}, CoordSystem.prototype.getViewRect = function getViewRect() {
				var size = this.map.getSize();
				return new this._echarts.graphic.BoundingRect(0, 0, size.width, size.height);
			}, CoordSystem.prototype.getRoamTransform = function getRoamTransform() {
				return this._echarts.matrix.create();
			};
			return CoordSystem;
		}
	}, {
		key: 'getEvents',
		value: function getEvents() {
			return {
				'_zoomstart': this.onZoomStart,
				'_zoomend': this.onZoomEnd,
				'_dragrotatestart': this.onDragRotateStart,
				'_dragrotateend': this.onDragRotateEnd,
				'_movestart': this.onMoveStart,
				'_moveend': this.onMoveEnd,
				'_resize': this._resetContainer
			};
		}
	}, {
		key: '_clearAndRedraw',
		value: function _clearAndRedraw() {
			if (this._container && this._container.style.display === 'none') {
				return;
			}
			this._ec.clear();
			this._ec.resize();
			this._prepareECharts();
			this._ec.setOption(this._ecOptions, false);
		}
	}, {
		key: 'onZoomStart',
		value: function onZoomStart() {

			this.hide();
		}
	}, {
		key: 'onZoomEnd',
		value: function onZoomEnd() {

			this._clearAndRedraw();
		}
	}, {
		key: 'onDragRotateStart',
		value: function onDragRotateStart() {

			this.hide();
		}
	}, {
		key: 'onDragRotateEnd',
		value: function onDragRotateEnd() {

			this._clearAndRedraw();
		}
	}, {
		key: 'onMoveStart',
		value: function onMoveStart() {

			this.hide();
		}
	}, {
		key: 'show',
		value: function show() {
			if (this._container) {
				this._container.style.display = '';
			}
		}
	}, {
		key: 'onMoveEnd',
		value: function onMoveEnd() {
			this._ec.setOption(this._ecOptions, false);
		}
	}, {
		key: 'clear',
		value: function clear() {
			this._ec.dispose();
			this._map.un('postrender', this.event);
			this._map.getView().un('change:resolution', this.event);
		}
	}]);

	return ADLayer;
}();

ADLayer.Element = {
	/**
  * 创建绝对定位div
  * @param id div id
  * @param style 样式的对象
  */
	createDiv: function createDiv(id, style) {
		if (!id) {
			return console.error("id不能为空");
		}
		var div = document.createElement('div');
		div.id = id;
		div.style.position = 'absolute';
		ADLayer.Element.modifyDomStyle(div, style);

		return div;
	},
	/**
  * 修改dom元素的样式相关属性
  * @param dom
  * @param style
  */
	modifyDomStyle: function modifyDomStyle(dom, style) {
		if (!style) {
			return;
		}
		if (style.height) {
			dom.style.height = style.height;
		}
		if (style.width) {
			dom.style.width = style.width;
		}
		if (style.border) {
			dom.style.border = style.border;
		}
		if (style.transition) {
			dom.style.transition = style.transition;
		}
		if (style.color) {
			dom.style.color = style.color;
		}
		if (style.lineHeight) {
			dom.style.lineHeight = style.lineHeight;
		}
		if (style.borderRadius) {
			dom.style.borderRadius = style.borderRadius;
		}
		if (style.textAlign) {
			dom.style.textAlign = style.textAlign;
		}
		if (style.backgroundColor) {
			dom.style.backgroundColor = style.backgroundColor;
		}
		if (style.zIndex) {
			dom.style.zIndex = style.zIndex;
		}
		if (style.top) {
			dom.style.top = style.top;
		}
		if (style.left) {
			dom.style.left = style.left;
		}
	},
	/**
  * 设置dom元素的绝对位置
  * @param dom 需要设定位置的dom元素
  * @param pos top，left数组,number
  */
	setDomPosition: function setDomPosition(dom, pos) {
		dom.style.top = pos[0] + "px";
		dom.style.left = pos[1] + "px";
	},
	/**
  * 设置dom的内容
  * @param inner 内容，可为文字，html
  */
	setDomContent: function setDomContent(dom, inner) {
		dom.innerHTML = inner;
	},
	/**
  * 在dom后追加元素，不指定id就在body后追加
  * @param dom
  * @param id
  * @returns
  */
	append: function append(dom, id) {
		if (typeof dom == "string") {
			if (!id) {
				return document.body.innerHTML = dom;
			}
			var target = document.getElementById(id);
			if (target) {
				return target.innerHTML = dom;
			}
		} else {
			if (!id) {
				return document.body.appendChild(dom);
			}
			var target = document.getElementById(id);
			if (target) {
				return target.appendChild(dom);
			}
		}
	},
	getDomStyle: function getDomStyle(dom, attr) {
		return dom.style[attr];
	},
	getDomCenter: function getDomCenter(dom, id) {
		var outer_h = '100%',
		    outer_w = '100%',
		    inner_h = 0,
		    inner_w = 0;
		if (!id) {
			outer_h = document.body.offsetHeight;
			outer_w = document.body.offsetWidth;
		} else {
			var outer = document.getElementById(id);
			if (outer) {
				outer_h = ADLayer.Element.getDomStyle(outer, 'height');
				outer_w = ADLayer.Element.getDomStyle(outer, 'width');
			} else {
				return console.error("未能找到id为" + id + "的元素");
			}
		}

		if (dom) {
			inner_h = ADLayer.Element.getDomStyle(dom, 'height');
			inner_w = ADLayer.Element.getDomStyle(dom, 'width');
		} else {
			return console.error("未提供dom元素");
		}

		return [(parseInt(outer_h) - parseInt(inner_h)) / 2, (parseInt(outer_w) - parseInt(inner_w)) / 2];
	}
};

exports.default = ADLayer;
