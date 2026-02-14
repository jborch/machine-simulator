using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Services;

public class WebSocketServer
{
    private readonly ConcurrentBag<WebSocket> _clients = new();
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public void AddClient(WebSocket socket)
    {
        _clients.Add(socket);
    }

    public async Task BroadcastAsync(SimulatorState state)
    {
        var json = JsonSerializer.Serialize(state, _jsonOptions);
        var bytes = Encoding.UTF8.GetBytes(json);
        var segment = new ArraySegment<byte>(bytes);

        var closedSockets = new List<WebSocket>();

        foreach (var socket in _clients)
        {
            if (socket.State == WebSocketState.Open)
            {
                try
                {
                    await socket.SendAsync(segment, WebSocketMessageType.Text, true, CancellationToken.None);
                }
                catch
                {
                    closedSockets.Add(socket);
                }
            }
            else
            {
                closedSockets.Add(socket);
            }
        }

        // ConcurrentBag doesn't support removal, so rebuild if needed
        if (closedSockets.Count > 0)
        {
            var remaining = _clients.Except(closedSockets).ToList();
            while (_clients.TryTake(out _)) { }
            foreach (var socket in remaining)
            {
                _clients.Add(socket);
            }
        }
    }
}
