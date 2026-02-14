using Microsoft.Extensions.Logging;
using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class PackingStation : IStation
{
    public string Name => "Packing";
    public string State { get; private set; } = "Idle";
    public bool HasOutput => Conveyor.Output != null;
    public bool CanReceive => Conveyor.Input == null;

    private IConveyor Conveyor { get; } = new Conveyor(100);
    private readonly ILogger<PackingStation> _logger;

    public PackingStation(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<PackingStation>();
    }

    public IMover? Send() => Conveyor.TakeOutput();

    public void Receive(IMover mover)
    {
        if (Conveyor.Input != null)
            throw new InvalidOperationException($"[{Name}] Input slot is occupied.");
        Conveyor.Input = mover;
    }

    public void Process(ICarrier carrier)
    {
        _logger.LogDebug("[{Station}] Processing carrier {CarrierId}", Name, carrier.Id);
    }

    public void Tick()
    {
        Conveyor.Tick();
    }

    public StationState GetState() => new(Name, State, new { Conveyor = Conveyor.GetState() });
}
