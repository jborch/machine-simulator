using Microsoft.Extensions.Logging;
using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class DeNestingStation : IStation
{
    public string Name => "DeNesting";
    public string State { get; private set; } = "Idle";
    public bool HasOutput => ExitConveyor.Output != null;
    public bool CanReceive => EntryConveyor.Input == null;

    private IConveyor EntryConveyor { get; } = new Conveyor(50);
    private LoadingMachine Machine { get; } = new();
    private IConveyor ExitConveyor { get; } = new Conveyor(50);
    private readonly ILogger<DeNestingStation> _logger;

    public DeNestingStation(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<DeNestingStation>();
    }

    public IMover? Send() => ExitConveyor.TakeOutput();

    public void Receive(IMover mover)
    {
        if (EntryConveyor.Input != null)
            throw new InvalidOperationException($"[{Name}] Input slot is occupied.");
        EntryConveyor.Input = mover;
    }

    public void Process(ICarrier carrier)
    {
        _logger.LogDebug("[{Station}] Processing carrier {CarrierId}", Name, carrier.Id);
    }

    public void Tick()
    {
        EntryConveyor.Tick();
        Machine.Tick();
        ExitConveyor.Tick();

        // Transfer: loading machine → exit conveyor
        if (Machine.HasOutput && ExitConveyor.Input == null)
        {
            var mover = Machine.Release();
            if (mover != null)
            {
                ExitConveyor.Input = mover;
                _logger.LogDebug("[{Station}] Mover {MoverId} loaded and moved to exit conveyor", Name, mover.Id);
            }
        }

        // Transfer: entry conveyor → loading machine
        if (EntryConveyor.Output != null && Machine.CanReceive)
        {
            var mover = EntryConveyor.TakeOutput();
            if (mover != null)
            {
                Machine.Receive(mover);
                _logger.LogDebug("[{Station}] Mover {MoverId} entered loading machine", Name, mover.Id);
            }
        }
    }

    public StationState GetState() => new(Name, State, new
    {
        EntryConveyor = EntryConveyor.GetState(),
        LoadingMachine = Machine.GetState(),
        ExitConveyor = ExitConveyor.GetState()
    });
}
