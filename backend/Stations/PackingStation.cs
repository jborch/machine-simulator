using Microsoft.Extensions.Logging;
using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class PackingStation : IStation
{
    public string Name => "Packing";
    public string State { get; private set; } = "Idle";
    public bool HasOutput => ExitConveyor.Output != null;
    public bool CanReceive => EntryConveyor.Input == null;

    private IConveyor EntryConveyor { get; } = new Conveyor(50);
    private UnloadingMachine Machine { get; } = new();
    private IConveyor ExitConveyor { get; } = new Conveyor(50);
    private readonly ILogger<PackingStation> _logger;

    public PackingStation(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<PackingStation>();
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

        // Transfer: unloading machine → exit conveyor
        if (Machine.HasOutput && ExitConveyor.Input == null)
        {
            var mover = Machine.Release();
            if (mover != null)
            {
                ExitConveyor.Input = mover;
                _logger.LogDebug("[{Station}] Mover {MoverId} unloaded and moved to exit conveyor", Name, mover.Id);
            }
        }

        // Transfer: entry conveyor → unloading machine
        if (EntryConveyor.Output != null && Machine.CanReceive)
        {
            var mover = EntryConveyor.TakeOutput();
            if (mover != null)
            {
                Machine.Receive(mover);
                _logger.LogDebug("[{Station}] Mover {MoverId} entered unloading machine", Name, mover.Id);
            }
        }
    }

    public StationState GetState() => new(Name, State, new
    {
        EntryConveyor = EntryConveyor.GetState(),
        UnloadingMachine = Machine.GetState(),
        ExitConveyor = ExitConveyor.GetState()
    });
}
