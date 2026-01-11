import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        print(f"Connected to {uri}")
        
        # specific test message
        test_msg = json.dumps({"type": "ping"})
        await websocket.send(test_msg)
        print(f"Sent: {test_msg}")
        
        try:
            response = await asyncio.wait_for(websocket.recv(), timeout=5)
            print(f"Received: {response}")
        except asyncio.TimeoutError:
            print("Timeout waiting for response")
            
if __name__ == "__main__":
    asyncio.run(test_websocket())
