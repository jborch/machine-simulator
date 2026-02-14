using Microsoft.Extensions.Logging;
using MachineSimulator.Backend.Models;
using MachineSimulator.Backend.Stations;

namespace MachineSimulator.Backend.Services;

public class Simulator
{
    private readonly IMachine[] _machines;
    private readonly ILogger<Simulator> _logger;
    private readonly WebSocketServer _webSocketServer;
    private bool _running;

    public SimulatorState? CurrentState { get; private set; }

    public Simulator(ILoggerFactory loggerFactory, WebSocketServer webSocketServer)
    {
        _logger = loggerFactory.CreateLogger<Simulator>();
        _webSocketServer = webSocketServer;

        var seedConveyor = new Conveyor("Buffer-DeNesting", 100);
        for (int i = 0; i < 12; i++)
        {
            seedConveyor.PlaceAt(i * 8, new Mover($"mover-{i + 1}"));
        }

        _machines =
        [
            seedConveyor,
            new DeNestingStation(),
            new Conveyor("DeNesting-Capping", 100),
            new CappingStation(),
            new Conveyor("Capping-Reject", 100),
            new RejectStation(),
            new Conveyor("Reject-Packing", 100),
            new PackingStation(),
            new Conveyor("Packing-Buffer", 100),
            new BufferStation(),
        ];
    }

    public void Tick()
    {
        foreach (var machine in _machines)
            machine.Tick();

        for (int i = 0; i < _machines.Length; i++)
        {
            var current = _machines[i];
            var next = _machines[(i + 1) % _machines.Length];

            if (current.HasOutput && next.CanReceive)
            {
                var mover = current.Send();
                if (mover != null)
                {
                    next.Receive(mover);
                    _logger.LogDebug("Moved {MoverId} from {Source} to {Destination}", mover.Id, current.Name, next.Name);
                }
            }
        }

        CurrentState = GetState();
        _ = _webSocketServer.BroadcastAsync(CurrentState);
    }

    public void Start() => _running = true;
    public void Stop() => _running = false;

    public SimulatorState GetState()
    {
        return new SimulatorState(
            _running,
            _machines.Select(m => new MachineState(m.Name, m.GetState())).ToList()
        );
    }

    public async Task Run(bool idle = false)
    {
        _running = !idle;
        _logger.LogInformation("Simulator running with {MachineCount} machines (idle={Idle}).", _machines.Length, idle);

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
