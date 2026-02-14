using Microsoft.Extensions.Logging;
using MachineSimulator.Backend.Models;
using MachineSimulator.Backend.Stations;

namespace MachineSimulator.Backend.Services;

public class Simulator
{
    private readonly List<IStation> _stations = new();
    private readonly ILogger<Simulator> _logger;
    private readonly WebSocketServer _webSocketServer;
    private bool _running;

    public SimulatorState? CurrentState { get; private set; }

    public Simulator(ILoggerFactory loggerFactory, WebSocketServer webSocketServer)
    {
        _logger = loggerFactory.CreateLogger<Simulator>();
        _webSocketServer = webSocketServer;
        _stations.Add(new DeNestingStation(loggerFactory));
        _stations.Add(new CappingStation(loggerFactory));
        _stations.Add(new RejectStation(loggerFactory));
        _stations.Add(new PackingStation(loggerFactory));
        _stations.Add(new BufferStation(loggerFactory));
    }

    public void Tick()
    {
        foreach (var station in _stations)
        {
            station.Tick();
        }

        for (int i = 0; i < _stations.Count; i++)
        {
            var station = _stations[i];
            if (!station.HasOutput)
                continue;

            var nextStation = _stations[(i + 1) % _stations.Count];
            if (!nextStation.CanReceive)
                continue;

            var mover = station.Send();
            if (mover != null)
            {
                nextStation.Receive(mover);
                _logger.LogDebug("Moved {MoverId} from {Source} to {Destination}", mover.Id, station.Name, nextStation.Name);
            }
        }

        CurrentState = GetState();
        _ = _webSocketServer.BroadcastAsync(CurrentState);
    }

    public void Start() => _running = true;
    public void Stop() => _running = false;

    public SimulatorState GetState()
    {
        return new SimulatorState(_running, _stations.Select(s => s.GetState()).ToList());
    }

    public async Task Run(bool idle = false)
    {
        _running = !idle;
        _logger.LogInformation("Simulator running with {StationCount} stations (idle={Idle}).", _stations.Count, idle);

        while (true)
        {
            if (_running)
            {
                Tick();
            }
            else
            {
                CurrentState = GetState();
                await _webSocketServer.BroadcastAsync(CurrentState);
            }
            await Task.Delay(100);
        }
    }
}
