'use client';

import styled from "styled-components";

import React, { useEffect, useRef, useState } from "react";

const ViewStyle = styled('div')`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100%;
    margin: auto;

    .score_section {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        color: #ffffff;
        text-align: center;
        font-size: 2rem;
    }

    .main_container {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        user-select: none; /* 드래그 중 텍스트 선택 방지 */
        background: rgba(0, 0, 0, 0);
    }

    .selection_area {
        display: none;
        position: absolute;
        border: 1px dashed #00f;
        background-color: rgba(0, 0, 255, 0.2);
        pointer-events: none; /* 마우스 이벤트가 차단되지 않도록 함 */
        //transition: all 0.2s ease; /* 크기 및 위치 변경에 대한 부드러운 전환 */
    }

    .item_box {
        height: 30px;
        width: 30px;
        margin: 10px;
        border: 1px solid red;
        border-radius: 50%;
        color: red;
        z-index: -1;
        text-align: center;
    }

    .item_box.detected {
        border: 1px solid blue;
    }

    .item_box.pop {
        transition: opacity .1s ease-in-out;
        opacity: 0;
    }
`

const View = () => {
    const canvasRef:React.MutableRefObject<any> = useRef<any>(null);
    
    let startX:number = 0;
    let startY:number = 0;
    let dragging:boolean = false;
    let timer:any = null;

    const [score, setScore] = useState<number>(0);
    const [time, setTime] = useState<number>(60);

    const getDistance = (x1:number, y1:number, x2:number, y2:number):number => {
        let x:number = x2 - x1;
        let y:number = y2 - y1;
    
        return Math.sqrt(x * x + y * y);
    }

    const itemDetected = (rectData:DOMRect) => {
        const container:HTMLElement|null = document.getElementById('main_container');
        const itemBoxList:HTMLCollection|undefined = container?.children;

        if(!!itemBoxList) {
            for(let i=2; i<itemBoxList.length; i++) {
                const itemBox:Element = itemBoxList[i];
                const itemTop:number = itemBox.getBoundingClientRect().top;
                const itemBottom:number  = itemBox.getBoundingClientRect().bottom;
                const itemLeft:number  = itemBox.getBoundingClientRect().left;
                const itemRight:number  = itemBox.getBoundingClientRect().right;
                const itemWidth:number  = itemBox.getBoundingClientRect().width / 2;
                const itemHeight:number  = itemBox.getBoundingClientRect().height / 2;

                if( rectData.left <= (itemLeft + itemWidth) && rectData.top <= (itemTop + itemHeight) && 
                    rectData.right >= (itemRight - itemWidth) && rectData.top <= (itemTop + itemHeight) && 
                    rectData.left <= (itemLeft + itemWidth) && rectData.bottom >= (itemBottom - itemHeight) && 
                    rectData.right >= (itemRight - itemWidth) && rectData.bottom >= (itemBottom - itemHeight) && 
                    itemBox.classList.contains('pop') === false) {
                    itemBox.classList.add('detected');
                } else {
                    itemBox.classList.remove('detected');
                }
            }
        }
    }

    const itemPop = () => {
        const container:HTMLElement|null = document.getElementById("main_container");
        const detectBox:NodeListOf<Element> = document.querySelectorAll('.item_box.detected');
        let sum:number = 0;

        if(!!detectBox) detectBox.forEach(item => sum += parseInt(item.id));

        if(sum === 10) {
            if(!!detectBox && !!container && !!canvasRef.current) {
                const ctx:CanvasRenderingContext2D = canvasRef.current.getContext("2d");
                const canvasWidth:number = canvasRef.current.getBoundingClientRect().width;
                const canvasHeight:number = canvasRef.current.getBoundingClientRect().height;
                const dpr:number = window.devicePixelRatio;

                const list:{x:number, y:number, vx:number, vy:number, gravity:number, radius:number, color:string, draw:() => void}[] = [];

                canvasRef.current.width = canvasWidth * dpr;
                canvasRef.current.height = canvasHeight * dpr;
                canvasRef.current.style.width = `${canvasWidth}px`;
                canvasRef.current.style.height = `${canvasHeight}px`;

                detectBox.forEach(item => {
                    item.classList.add('pop');
                    const itemX:number = Math.abs(item.getBoundingClientRect().x - container.getBoundingClientRect().x);
                    const itemY:number = Math.abs(item.getBoundingClientRect().y - container.getBoundingClientRect().y);

                    const ball:{x:number, y:number, vx:number, vy:number, gravity:number, radius:number, color:string, draw:() => void} = {
                        x: itemX + 15,
                        y: itemY + 15,
                        vx: Math.random() * 20 - 10,
                        vy: Math.random() * 5 - 15,
                        gravity: 1,
                        radius: 15,
                        color: "red",
            
                        draw() {
                            ctx.save();
                            ctx.beginPath();
                            ctx.strokeStyle = this.color;
                            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
                            ctx.stroke();
                            ctx.closePath();
                            ctx.restore();
                        },
                    };
                    list.push(ball);            
                });

                list.forEach(item => {
                    item.draw();
                });
            
                setTimeout(() => {
                    const drawFrame = () => {
                        window.requestAnimationFrame(drawFrame);
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                        list.forEach(item => {
                            item.draw();
                            item.vy += item.gravity;
                            item.x += item.vx;
                            item.y += item.vy;
                        });
                    }
                    drawFrame();
                }, 100);

                const touchstone:number = detectBox.length;
                let point:number = (touchstone * 2) + 1;

                setScore((score) => (score + point));
                // switch (touchstone) {
                //     case 2 : point = 5; break;
                //     case 3 : point = 7; break;
                //     case 4 : point = 9; break;
                //     case 5 : point = 11; break;
                //     case 6 : point = 13; break;
                //     case 7 : point = 15; break;
                //     case 8 : point = 17; break;
                //     case 9 : point = 19; break;
                //     case 10 : point = 21; break;
                // }
            }
        }
    }

    const itemCreate = () => {
        const createCnt:number = 55;
        for(let i=0; i<createCnt; i++) {
            let random:number = Math.floor(Math.random() * 10);
            if(random === 0) random = 1;
            
    		const container:HTMLElement|null = document.getElementById("main_container");
            const item:HTMLDivElement = document.createElement('div');

            item.classList.add('item_box');
            item.textContent = random.toString();
            item.setAttribute('id', random.toString());

            if(!!container) container.appendChild(item);
        }
    }

    // const fnCountDown = () => { 
    //     timer = setTimeout(() => {setTime((time) => (time - 1))}, 1000);
    // }

    // useEffect(() => {
    //     if(time === 0) {clearTimeout(timer); alert('시간초과');}
    //     else {fnCountDown();}
    // }, [time])

    useEffect(() => {
        itemCreate();
        // fnCountDown();
        const container:HTMLElement|null = document.getElementById('main_container');
        const selectionArea:HTMLElement|null = document.getElementById('selection_area');

        if(!!container && !!selectionArea) {
            container.addEventListener('mousedown', function(event) {
                startX = event.pageX - container.offsetLeft;
                startY = event.pageY - container.offsetTop;
                dragging = true;
                selectionArea.style.display = 'none';
                selectionArea.style.width = '0px';
                selectionArea.style.height = '0px';
                event.preventDefault();
            });
    
            document.addEventListener('mousemove', function(event) {
                if (!dragging) return;
                const rectData:DOMRect = selectionArea.getBoundingClientRect();
                const moveX:number = event.pageX - container.offsetLeft;
                const moveY:number = event.pageY - container.offsetTop;
                const width:number = Math.abs(moveX - startX);
                const height:number = Math.abs(moveY - startY);

                selectionArea.style.display = 'block';
                selectionArea.style.width = `${width}px`;
                selectionArea.style.height = `${height}px`;
                selectionArea.style.left = `${Math.min(startX, moveX)}px`;
                selectionArea.style.top = `${Math.min(startY, moveY)}px`;

                itemDetected(rectData);
                event.preventDefault();
            });
    
            document.addEventListener('mouseup', function(event) {
                startX = 0;
                startY = 0;
                dragging = false;
                selectionArea.style.display = 'none';
                selectionArea.style.width = '0px';
                selectionArea.style.height = '0px';

                itemPop();

                const itemBox:NodeListOf<Element> = document.querySelectorAll('.item_box');
                if(!!itemBox) itemBox.forEach(item => item.classList.remove('detected'));
                event.preventDefault(); // 드래그 작업 종료
            });
        }
    }, [])

    return (
        <ViewStyle>
            <div id="main_container" className="main_container" style={{border: "1px solid red", width:"600px", height:"300px"}}>
                <div className="score_section">
                    {score} / {time}
                </div>
                <div id="selection_area" className="selection_area"></div>
            </div>
            <canvas ref={canvasRef} style={{position:"absolute", border:"1px solid red", width:"600px", height:"300px", zIndex:-1}} >
            </canvas>
        </ViewStyle>
    )
}

export default View;
