using System.Net.WebSockets;
using MachineSimulator.Backend.Services;

var verbose = args.Contains("--verbose");

var builder = WebApplication.CreateBuilder(args);
builder.Logging.SetMinimumLevel(verbose ? LogLevel.Debug : LogLevel.Information);

var app = builder.Build();

app.UseWebSockets();

var webSocketServer = new WebSocketServer();

app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var socket = await context.WebSockets.AcceptWebSocketAsync();
        webSocketServer.AddClient(socket);

        // Keep the connection alive until the client disconnects
        var buffer = new byte[1024];
        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == WebSocketMessageType.Close)
            {
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
            }
        }
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

var simulator = new Simulator(app.Services.GetRequiredService<ILoggerFactory>(), webSocketServer);
_ = Task.Run(() => simulator.Run());

app.Run();
