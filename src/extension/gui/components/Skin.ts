/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/// <reference path="../../../egret/display/DisplayObject.ts"/>
/// <reference path="../../../egret/events/EventDispatcher.ts"/>
/// <reference path="../core/IContainer.ts"/>
/// <reference path="../core/ISkin.ts"/>
/// <reference path="../core/IStateClient.ts"/>
/// <reference path="../core/IVisualElement.ts"/>
/// <reference path="../core/IVisualElementContainer.ts"/>
/// <reference path="../events/ElementExistenceEvent.ts"/>
/// <reference path="../events/StateChangeEvent.ts"/>
/// <reference path="../states/StateClientHelper.ts"/>

module ns_egret {

	export class Skin extends EventDispatcher 
		implements IStateClient, ISkin, IContainer{
		/**
		 * 构造函数
		 */		
		public constructor(){
			super();
			this.stateClientHelper = new StateClientHelper(this);
		}
		
		/**
		 * 组件的最大测量宽度,仅影响measuredWidth属性的取值范围。
		 */	
		public maxWidth:number = 10000;
		/**
		 * 组件的最小测量宽度,此属性设置为大于maxWidth的值时无效。仅影响measuredWidth属性的取值范围。
		 */
		public minWidth:number = 0;
		/**
		 * 组件的最大测量高度,仅影响measuredHeight属性的取值范围。
		 */
		public maxHeight:number = 10000;
		/**
		 * 组件的最小测量高度,此属性设置为大于maxHeight的值时无效。仅影响measuredHeight属性的取值范围。
		 */
		public minHeight:number = 0;
		/**
		 * 组件宽度
		 */
		public width:number = NaN;
		/**
		 * 组件高度
		 */
		public height:number = NaN;
		
		/**
		 * x坐标
		 */		
		public x:number = 0;
		/**
		 * y坐标 
		 */		
		public y:number = 0;
		
		//以下这两个属性无效，仅用于防止DXML编译器报错。
		public percentWidth:number = NaN;
		public percentHeight:number = NaN;
		
		//========================state相关函数===============start=========================

		private stateClientHelper:StateClientHelper;
		
		/**
		 * @inheritDoc
		 */
		public get states():Array{
			return this.stateClientHelper.states;
		}
		
		public set states(value:Array):void{
			this.stateClientHelper.states = value;
		}
		
		/**
		 * @inheritDoc
		 */
		public get currentState():string{
			return this.stateClientHelper.currentState;
		}
		
		public set currentState(value:string):void{
			this.stateClientHelper.currentState = value;
			if (this._hostComponent&&this.stateClientHelper.currentStateChanged){
				this.stateClientHelper.commitCurrentState();
				this.commitCurrentState();
			}
		}
		
		/**
		 * @inheritDoc
		 */
		public hasState(stateName:string):boolean{
			return this.stateClientHelper.hasState(stateName); 
		}
		
		/**
		 * 应用当前的视图状态。子类覆盖此方法在视图状态发生改变时执行相应更新操作。
		 */
		public commitCurrentState():void{
			
		}
		//========================state相关函数===============end=========================
		
		private _hostComponent:SkinnableComponent;
		/**
		 * @inheritDoc
		 */
		public get hostComponent():SkinnableComponent{
			return this._hostComponent;
		}
		/**
		 * @inheritDoc
		 */
		public set hostComponent(value:SkinnableComponent):void{
			if(this._hostComponent==value)
				return;
			var i:number;
			if(this._hostComponent){
				for(i = this._elementsContent.length - 1; i >= 0; i--){
					this.elementRemoved(this._elementsContent[i], i);
				}
			}
			
			this._hostComponent = value;
			
			if(this._hostComponent){			
				var n:number = this._elementsContent.length;
				for (i = 0; i < n; i++){   
					var elt:IVisualElement = this._elementsContent[i];
					if (elt.parent instanceof IVisualElementContainer)
						(<IVisualElementContainer> (elt.parent)).removeElement(elt);
					else if(elt.owner instanceof IContainer)
						(<IContainer> (elt.owner)).removeElement(elt);
					this.elementAdded(elt, i);
				}
				
				this.stateClientHelper.initializeStates();
				
				if(this.stateClientHelper.currentStateChanged){
					this.stateClientHelper.commitCurrentState();
					this.commitCurrentState();
				}
			}
		}
		
		private _elementsContent:Array = [];
		/**
		 * 返回子元素列表
		 */		
		public getElementsContent():Array{
			return this._elementsContent;
		}
		
		/**
		 * 设置容器子对象数组 。数组包含要添加到容器的子项列表，之前的已存在于容器中的子项列表被全部移除后添加列表里的每一项到容器。
		 * 设置该属性时会对您输入的数组进行一次浅复制操作，所以您之后对该数组的操作不会影响到添加到容器的子项列表数量。
		 */		
		public set elementsContent(value:Array):void{
			if(value==null)
				value = [];
			if(value==this._elementsContent)
				return;
			if(this._hostComponent){
				var i:number;
				for (i = this._elementsContent.length - 1; i >= 0; i--){
					this.elementRemoved(this._elementsContent[i], i);
				}
				
				this._elementsContent = value.concat();
				
				var n:number = this._elementsContent.length;
				for (i = 0; i < n; i++){   
					var elt:IVisualElement = this._elementsContent[i];
					
					if(elt.parent instanceof IVisualElementContainer)
						(<IVisualElementContainer> (elt.parent)).removeElement(elt);
					else if(elt.owner instanceof IContainer)
						(<IContainer> (elt.owner)).removeElement(elt);
					this.elementAdded(elt, i);
				}
			}
			else{
				this._elementsContent = value.concat();
			}
		}
		
		/**
		 * @inheritDoc
		 */
		public get numElements():number{
			return this._elementsContent.length;
		}
		
		/**
		 * @inheritDoc
		 */
		public getElementAt(index:number):IVisualElement{
			this.checkForRangeError(index);
			return this._elementsContent[index];
		}
		
		private checkForRangeError(index:number, addingElement:boolean = false):void{
			var maxIndex:number = this._elementsContent.length - 1;
			
			if (addingElement)
				maxIndex++;
			
			if (index < 0 || index > maxIndex)
				throw new RangeError("索引:\""+index+"\"超出可视元素索引范围");
		}
		/**
		 * @inheritDoc
		 */
		public addElement(element:IVisualElement):IVisualElement{
			var index:number = this.numElements;
			
			if (element.owner == this)
				index = this.numElements-1;
			
			return this.addElementAt(element, index);
		}
		/**
		 * @inheritDoc
		 */
		public addElementAt(element:IVisualElement, index:number):IVisualElement{
			this.checkForRangeError(index, true);
			
			var host:any = element.owner; 
			if (host == this){
				this.setElementIndex(element, index);
				return element;
			}
			else if (element.parent instanceof IVisualElementContainer){
				(<IVisualElementContainer> (element.parent)).removeElement(element);
			}
			else if(host instanceof IContainer){
				(<IContainer> host).removeElement(element);
			}
			
			this._elementsContent.splice(index, 0, element);
			
			if(this._hostComponent)
				this.elementAdded(element, index);
			
			return element;
		}
		/**
		 * @inheritDoc
		 */
		public removeElement(element:IVisualElement):IVisualElement{
			return this.removeElementAt(this.getElementIndex(element));
		}
		/**
		 * @inheritDoc
		 */
		public removeElementAt(index:number):IVisualElement{
			this.checkForRangeError(index);
			
			var element:IVisualElement = this._elementsContent[index];
			
			if(this._hostComponent)
				this.elementRemoved(element, index);
			
			this._elementsContent.splice(index, 1);
			
			return element;
		}
			
		/**
		 * @inheritDoc
		 */
		public getElementIndex(element:IVisualElement):number{
			return this._elementsContent.indexOf(element);
		}
		/**
		 * @inheritDoc
		 */
		public setElementIndex(element:IVisualElement, index:number):void{
			this.checkForRangeError(index);
			
			var oldIndex:number = this.getElementIndex(element);
			if (oldIndex==-1||oldIndex == index)
				return;
			
			if(this._hostComponent)
				this.elementRemoved(element, oldIndex, false);
			
			this._elementsContent.splice(oldIndex, 1);
			this._elementsContent.splice(index, 0, element);
			
			if(this._hostComponent)
				this.elementAdded(element, index, false);
		}
		
		private addToDisplayListAt:QName = new QName(dx_internal,"addToDisplayListAt");
		private removeFromDisplayList:QName = new QName(dx_internal,"removeFromDisplayList");
		/**
		 * 添加一个显示元素到容器
		 */		
		public elementAdded(element:IVisualElement, index:number, notifyListeners:boolean = true):void{
			element.ownerChanged(this);
			if(element instanceof DisplayObject)
				this._hostComponent[this.addToDisplayListAt](<DisplayObject> element, index);
			
			if (notifyListeners){
				if (this.hasEventListener(ElementExistenceEvent.ELEMENT_ADD))
					this.dispatchEvent(new ElementExistenceEvent(
						ElementExistenceEvent.ELEMENT_ADD, false, false, element, index));
			}
			
			this._hostComponent.invalidateSize();
			this._hostComponent.invalidateDisplayList();
		}
		/**
		 * 从容器移除一个显示元素
		 */		
		public elementRemoved(element:IVisualElement, index:number, notifyListeners:boolean = true):void{
			if (notifyListeners){        
				if (this.hasEventListener(ElementExistenceEvent.ELEMENT_REMOVE))
					this.dispatchEvent(new ElementExistenceEvent(
						ElementExistenceEvent.ELEMENT_REMOVE, false, false, element, index));
			}
			
			var childDO:DisplayObject = <DisplayObject> element; 
			if (childDO && childDO.parent == this._hostComponent){
				this._hostComponent[this.removeFromDisplayList](element);
			}
			
			element.ownerChanged(null);
			this._hostComponent.invalidateSize();
			this._hostComponent.invalidateDisplayList();
		}
	}
}