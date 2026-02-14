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
    private bool _resetRequested;
    private int _tickDelay = 100;

    public SimulatorState? CurrentState { get; private set; }

    public Simulator(ILoggerFactory loggerFactory, WebSocketServer webSocketServer)
    {
        _logger = loggerFactory.CreateLogger<Simulator>();
        _webSocketServer = webSocketServer;

        var conveyorDN = new Conveyor("Buffer-DeNesting", 200);
        var conveyorDC = new Conveyor("DeNesting-Capping", 200);
        var conveyorCR = new Conveyor("Capping-Reject", 200);
        var conveyorRP = new Conveyor("Reject-Packing", 200);
        var conveyorPB = new Conveyor("Packing-Buffer", 200);

        var nestInfeed = new NestInfeed();
        var cartonOutfeed = new CartonOutfeed();

        // Stations tick before conveyors so they only see movers
        // that reached the conveyor output on a previous tick.
        _machines =
        [
            nestInfeed,
            new DeNestingStation(conveyorDN, conveyorDC, nestInfeed),
            new CappingStation(conveyorDC, conveyorCR),
            new RejectStation(conveyorCR, conveyorRP),
            new PackingStation(conveyorRP, conveyorPB, cartonOutfeed),
            new BufferStation(conveyorPB, conveyorDN),
            cartonOutfeed,
            conveyorDN,
            conveyorDC,
            conveyorCR,
            conveyorRP,
            conveyorPB,
        ];

        foreach (var machine in _machines)
            machine.Initialize();
    }

    public void Start() => _running = true;
    public void Stop() => _running = false;
    public void Reset() => _resetRequested = true;
    public void SetTickDelay(int ms) => _tickDelay = Math.Max(1, ms);

    public async Task Run(bool idle, CancellationToken ct)
    {
        _running = !idle;
        _logger.LogInformation("Simulator running with {MachineCount} machines (idle={Idle}).", _machines.Length, idle);

        try
        {
            while (!ct.IsCancellationRequested)
            {
                if (_resetRequested)
                {
                    _resetRequested = false;
                    _running = false;
                    foreach (var machine in _machines)
                        machine.Reset();
                    foreach (var machine in _machines)
                        machine.Initialize();
                }

                if (_running)
                {
                    foreach (var machine in _machines)
                        machine.Tick();
                }

                CurrentState = new SimulatorState(
                    _running,
                    _machines.Select(m => new MachineState(m.Name, m.GetState())).ToList()
                );
                await _webSocketServer.BroadcastAsync(CurrentState);

                await Task.Delay(_tickDelay, ct);
            }
        }
        catch (OperationCanceledException) { }
    }
}
