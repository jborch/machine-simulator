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

        var conveyorDN = new Conveyor("Buffer-DeNesting", 100);
        var conveyorDC = new Conveyor("DeNesting-Capping", 100);
        var conveyorCR = new Conveyor("Capping-Reject", 100);
        var conveyorRP = new Conveyor("Reject-Packing", 100);
        var conveyorPB = new Conveyor("Packing-Buffer", 100);

        var nestInfeed = new NestInfeed();
        var cartonOutfeed = new CartonOutfeed();

        for (int i = 0; i < 12; i++)
            conveyorDN.PlaceAt(i * 8, new Mover($"mover-{i + 1}"));

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
    }

    public void Tick()
    {
        foreach (var machine in _machines)
            machine.Tick();

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
