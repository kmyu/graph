var net = net || {};
net.smartworks = net.smartworks || {};
net.smartworks.Swgraph = (function(){

	//상수
	var canvasPadding = 0;
	// canvasPadding + pinHeight
	canvasPadding = canvasPadding + 10
	var titleHeight = 10;

	var pinColor = 'gray';
	var fontColor = '#000';
	var fontStyle = '8px serif';
	var diagonalColor = '#BDBDBD';

	//상수 끝

	var GraphItem = function(options){
		
		this.backgroundPattern = 'false'

		this.title = '전체 # 건'; //'전체 # 건'
		this.backgroundColor = '';
		this.count = 0;
		this.minWidth = 90;
		this.endPin = 'true';

		this.subitemTitle = '완료 # 건'; //'나의 완료 #건 , 나의 진행 #건 , 나의 미진행 #건'
		this.subitemBackgroundColor = '';
		this.subCount = 0;
		this.subMinWidth = 0;

		if (options) {
			for (key in options) {
				this[key] = options[key];
			}
		}

		this.canvasInfo = {};

	}
	var getDefaultGraphItem = function(){
		return new GraphItem();
	}
	var getTotalCount = function(graphItemList){
		if (!graphItemList) {
			return 0;
		}
		var result = 0;
		for (var i = 0; i < graphItemList.length; i++) {
			result += graphItemList[i].count;
		}
		return result;
	}
	
	var drawRoundRect = function(context , rectX , rectY , rectWidth , rectHeight){

		context.save();

		var cornerRadius = 15;

		// Reference rectangle without rounding, for size comparison
		//context.fillRect(200, 50, rectWidth, rectHeight);

		// Set faux rounded corners
		context.lineJoin = "round";
		context.lineWidth = cornerRadius;

		// Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
		context.strokeRect(rectX+(cornerRadius/2), rectY+(cornerRadius/2), rectWidth-cornerRadius, rectHeight-cornerRadius);
		context.fillRect(rectX+(cornerRadius/2), rectY+(cornerRadius/2), rectWidth-cornerRadius, rectHeight-cornerRadius);

		context.restore();
	}


	// pin 함수
	var drawPin = function(canvas , context , x , y , width , height){

		console.log('drawPin');

		context.save();

		context.beginPath();
		context.strokeStyle = pinColor;
		context.lineWidth = 2;
	    context.arc(x+width, y-6 , 3, 0, 2 * Math.PI, false);
		context.closePath();
		context.stroke();

		context.beginPath();
		context.strokeStyle = pinColor;
		context.moveTo(x+width , y-3);
		context.lineTo(x+width , y+height+3);
		context.closePath();
		context.stroke();

		context.restore();
	}

	// 글씨입력 함수
	var drawTitle = function(canvas , context , graphItem){

		context.save();

		if (graphItem.title) {	
			//실제 카운터를 입려한다 
			var title = graphItem.title.replace('#', graphItem.count);

			context.font = fontStyle;
			context.fillStyle = fontColor;
			//context.fillStyle = graphItem.color;
			context.fillText(title, graphItem.canvasInfo.graphX + graphItem.canvasInfo.graphItemWidth - 50, graphItem.canvasInfo.graphY + graphItem.canvasInfo.graphItemHeight + 15);


			//sub graph title

			//실제 카운터를 입려한다 
			var subTitle = graphItem.subitemTitle.replace('#', graphItem.subCount);

			context.font = '4px serif';
			context.fillStyle = '#fff';
			//글자를 중앙에 위치시키기위한 y좌표 계산 값 
			var centerY = graphItem.canvasInfo.subGraph.graphY + (graphItem.canvasInfo.subGraph.graphItemHeight / 2) + 3;
			context.fillText(subTitle, graphItem.canvasInfo.subGraph.graphX + 5, centerY);

		}

		context.restore();
	}
	var fillDiagonal = function(canvas , context , x , y , width , height){
		
		console.log('fillDiagonal');

		context.save();

		context.lineWidth = 1;

		var space = 5;//사선 - 사선
		var inSpace = 0.5; //보더 - 사선

		context.strokeStyle = diagonalColor;

		context.beginPath();
		
		for (var i = x; i < x + width ; i = i+space) {

			var tempX = i + inSpace;
			var tempY = y + inSpace;
			context.moveTo(tempX, tempY);
			while(true) {

				tempX = tempX + 1;
				tempY = tempY + 1;
				if ((tempX === x + width - inSpace) || (tempY === y + height - inSpace) || (x + width - inSpace) - tempX < 1) {
				//if ((tempX === x + width - inSpace) || (tempY === y + height - inSpace)) {
					break;
				}
			}
			context.lineTo(tempX , tempY);
		}
		for (var i = y+space; i < y + height; i = i+space) {
			var tempY = i + inSpace;
			var tempX = x + inSpace;
			context.moveTo(tempX, tempY);
			while(true) {
				tempX = tempX + 1;
				tempY = tempY + 1;
				if ((tempX === x + width - inSpace) || (tempY === y + height - inSpace)) {
					break;
				}
			}
			context.lineTo(tempX , tempY);
		}

		context.closePath();
		context.stroke();

		context.restore();
	}

//draw animation

	var drawGraphWithAnimate = function(graphItemList, canvas , context){

		var graphItemListLength = graphItemList.length;
		for (var i = 0; i < graphItemListLength; i++) {

			var graphItem = graphItemList[i];
			context.fillStyle = graphItem.backgroundColor;
			context.fillRect(graphItem.canvasInfo.graphX+1 , graphItem.canvasInfo.graphY , graphItem.canvasInfo.graphItemWidth , graphItem.canvasInfo.graphItemHeight);

			context.fillStyle = graphItem.subitemBackgroundColor;

			if (graphItem.endPin) {
				drawPin(canvas , context , graphItem.canvasInfo.graphX , graphItem.canvasInfo.graphY , graphItem.canvasInfo.graphItemWidth, graphItem.canvasInfo.graphItemHeight);
			}
			var ani = function(_graphItem , _tempGraphX){

				setTimeout(function(){

					if (_tempGraphX > _graphItem.canvasInfo.subGraph.graphItemWidth || !_graphItem.subCount || _graphItem.count == 0) {
						
						if (_graphItem.backgroundPattern) {
							fillDiagonal(canvas , context , _graphItem.canvasInfo.graphX , _graphItem.canvasInfo.graphY , _graphItem.canvasInfo.graphItemWidth, _graphItem.canvasInfo.graphItemHeight);
						}
						drawTitle(canvas , context , _graphItem);

					} else {
						context.fillStyle = _graphItem.subitemBackgroundColor;
						context.fillRect(_graphItem.canvasInfo.subGraph.graphX , _graphItem.canvasInfo.subGraph.graphY , _tempGraphX , _graphItem.canvasInfo.subGraph.graphItemHeight);
						
						_tempGraphX += 5;
						ani(_graphItem, _tempGraphX);
					}

				}, 1);
			};
			ani(graphItem, 0);

		}
	}

	var drawGraph = function(graphItemList, canvas , context) {

		context.save();

		if (!canvas || !context || !graphItemList ) {
			return;
		}

		var graphItemHeight = context.canvas.clientHeight - (canvasPadding * 2) - titleHeight;

		//clear canvas
		context.clearRect(0, 0, context.canvas.clientWidth , context.canvas.clientHeight);

		//count 가 0이거나 width 가 minWidth 보다 작은 item은 minWidth를 적용시키기 위해 필요한 계산 값
		var totalGraphCountForWidth = getTotalCount(graphItemList);

		var canvasWidth = context.canvas.clientWidth;
		var graphWidth = canvasWidth - (canvasPadding * 2);

		var graphX = canvasPadding;
		var graphY = canvasPadding;

		var graphItemListLength = graphItemList.length;

		//minWidth 를 빼고 나머지(값이 존재하는) 항목들의 width를 계산하기 위한 
		for (var i = 0; i < graphItemListLength; i++) {
			var graphItem = graphItemList[i];

			var count = graphItem.count;
			var graphItemWidth = (count * graphWidth) / totalGraphCountForWidth;

			if (graphItemWidth == 0) {
				graphWidth -= graphItem.minWidth;
			} else if (graphItemWidth != 0 && graphItemWidth < graphItem.minWidth) {
				graphWidth -= graphItem.minWidth;
				totalGraphCountForWidth -= count;
			}
		}
		for (var i = 0; i < graphItemListLength; i++) {

			var graphItem = graphItemList[i];

			var graphItemWidth = 0;
			var count = graphItem.count;

			if (count == 0) {
				graphItemWidth = graphItem.minWidth;
			} else {
				graphItemWidth = (count * graphWidth) / totalGraphCountForWidth;
				if (graphItemWidth < graphItem.minWidth) {
					graphItemWidth = graphItem.minWidth;
				}				
			}

			//context.fillStyle = graphItem.backgroundColor;
			//context.fillRect(graphX , graphY , graphItemWidth , graphItemHeight);

			graphItem.canvasInfo = {graphX : graphX, graphY : graphY , graphItemWidth : graphItemWidth , graphItemHeight : graphItemHeight};

			//draw subGraph
			if (graphItem.subCount) {
				var subGraphWidth = (graphItemWidth * graphItem.subCount)/graphItem.count;
				//context.fillStyle = graphItem.subitemBackgroundColor;
				//context.fillRect(graphX , graphY + 5 , subGraphWidth , graphItemHeight -10);
			}
			graphItem.canvasInfo.subGraph = {graphX : graphX , graphY : graphY + 5 , graphItemWidth : subGraphWidth , graphItemHeight : graphItemHeight -10}

			graphX += graphItemWidth;

		}

		drawGraphWithAnimate(graphItemList , canvas , context);

		context.restore();
	}

	return {
		GraphItem : GraphItem
		, getDefaultGraphItem : getDefaultGraphItem
		, getTotalCount : getTotalCount
		, drawGraph : drawGraph
	}

}())