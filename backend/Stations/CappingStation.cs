using Microsoft.Extensions.Logging;
using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class CappingStation : IStation
{
    public string Name => "Capping";
    public string State { get; private set; } = "Idle";
    public bool HasOutput => Conveyor.Output != null;
    public bool CanReceive => Conveyor.Input == null;

    private IConveyor Conveyor { get; } = new Conveyor(100);
    private readonly ILogger<CappingStation> _logger;

    public CappingStation(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<CappingStation>();
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
