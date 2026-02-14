using Microsoft.Extensions.Logging;
using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class DeNestingStation : IStation
{
    public string Name => "DeNesting";
    public string State { get; private set; } = "Idle";
    public bool HasOutput => Conveyor.Output != null;
    public bool CanReceive => Conveyor.Input == null;

    private IConveyor Conveyor { get; } = new Conveyor(100);
    private readonly ILogger<DeNestingStation> _logger;

    public DeNestingStation(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<DeNestingStation>();
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
}
