using Microsoft.Extensions.Logging;
using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class BufferStation : IStation
{
    public string Name => "Buffer";
    public string State { get; private set; } = "Idle";
    public bool HasOutput => Conveyor.Output != null;
    public bool CanReceive => Conveyor.Input == null;

    private Conveyor Conveyor { get; }
    private readonly ILogger<BufferStation> _logger;

    public BufferStation(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<BufferStation>();
        Conveyor = new Conveyor(100);
        for (int i = 0; i < 12; i++)
        {
            Conveyor.PlaceAt(i * 8, new Mover($"mover-{i + 1}"));
        }
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
