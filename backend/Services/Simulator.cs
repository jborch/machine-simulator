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

    public SimulatorState? CurrentState { get; private set; }

    public Simulator(ILoggerFactory loggerFactory, WebSocketServer webSocketServer)
    {
        _logger = loggerFactory.CreateLogger<Simulator>();
        _webSocketServer = webSocketServer;

        var conveyorDN = new Conveyor("Buffer-DeNesting", 100);
        var conveyorDC = new Conveyor("DeNesting-Capping", 100);
        var conveyorCR = new Conveyor("Capping-Reject", 100);
        var conveyorRP = new Conveyor("Reject-Packing", 100);
        var conveyorPB = new Conveyor("Packing-Buffer", 100);

        var nestInfeed = new NestInfeed();
        var cartonOutfeed = new CartonOutfeed();

        _machines =
        [
            nestInfeed,
            conveyorDN,
            new DeNestingStation(conveyorDN, conveyorDC, nestInfeed),
            conveyorDC,
            new CappingStation(conveyorDC, conveyorCR),
            conveyorCR,
            new RejectStation(conveyorCR, conveyorRP),
            conveyorRP,
            new PackingStation(conveyorRP, conveyorPB, cartonOutfeed),
            conveyorPB,
            new BufferStation(conveyorPB, conveyorDN),
            cartonOutfeed,
        ];

        foreach (var machine in _machines)
            machine.Initialize();
    }

    public void Start() => _running = true;
    public void Stop() => _running = false;
    public void Reset() => _resetRequested = true;

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

                await Task.Delay(100, ct);
            }
        }
        catch (OperationCanceledException) { }
    }
}
