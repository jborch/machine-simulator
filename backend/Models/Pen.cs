namespace MachineSimulator.Backend.Models;

public class Pen : IItem
{
    public string Id { get; }
    public string Name => "Pen";
    public int? InspectionResult { get; set; }

    public Pen(string id)
    {
        Id = id;
    }
}
