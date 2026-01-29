import asyncio
import websockets
import json

# Lista para guardar las conexiones de los jugadores
players = []

async def handler(websocket, path):
    # Añadir al jugador a la lista
    players.append(websocket)
    try:
        # Recibir y enviar los datos del jugador
        async for message in websocket:
            player_data = json.loads(message)
            # Enviar los datos a todos los jugadores
            for player in players:
                if player != websocket:
                    await player.send(message)
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Conexión cerrada: {e}")
    finally:
        players.remove(websocket)

start_server = websockets.serve(handler, "localhost", 8080)

# Ejecutar el servidor
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
