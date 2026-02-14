using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using MachineSimulator.Backend.Services;

var verbose = args.Contains("--verbose");
var idle = args.Contains("--idle");

var builder = WebApplication.CreateBuilder(args);
builder.Logging.SetMinimumLevel(verbose ? LogLevel.Debug : LogLevel.Information);
builder.WebHost.UseUrls("http://localhost:5000");

var app = builder.Build();

app.UseWebSockets();

var webSocketServer = new WebSocketServer();
var simulator = new Simulator(app.Services.GetRequiredService<ILoggerFactory>(), webSocketServer);

app.MapGet("/health", () => Results.Ok("ok"));

app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var socket = await context.WebSockets.AcceptWebSocketAsync();
        webSocketServer.AddClient(socket);

        var buffer = new byte[1024];
        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), context.RequestAborted);
            if (result.MessageType == WebSocketMessageType.Close)
            {
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
            }
            else if (result.MessageType == WebSocketMessageType.Text)
            {
                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                try
                {
                    var doc = JsonDocument.Parse(message);
                    var command = doc.RootElement.GetProperty("command").GetString();
                    switch (command)
                    {
                        case "start":
                            simulator.Start();
                            break;
                        case "stop":
                            simulator.Stop();
                            break;
                        case "reset":
                            simulator.Reset();
                            break;
                    }
                }
                catch (Exception)
                {
                    // Ignore malformed messages
                }
            }
        }
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

var cts = new CancellationTokenSource();
var simulatorTask = Task.Run(() => simulator.Run(idle, cts.Token));

var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStopping.Register(() => cts.Cancel());

app.Run();
await simulatorTask;
