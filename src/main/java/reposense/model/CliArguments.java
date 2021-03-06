package reposense.model;

import java.nio.file.Path;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Represents command line arguments user supplied when running the program.
 */
public class CliArguments {
    private Path configFilePath;
    private Path outputFilePath;
    private Optional<Date> sinceDate;
    private Optional<Date> untilDate;
    private List<String> formats;

    public CliArguments(Path configFilePath, Path outputFilePath,
            Optional<Date> sinceDate, Optional<Date> untilDate, List<String> formats) {
        this.configFilePath = configFilePath;
        this.outputFilePath = outputFilePath;
        this.sinceDate = sinceDate;
        this.untilDate = untilDate;
        this.formats = formats;
    }

    public Path getConfigFilePath() {
        return configFilePath;
    }

    public Path getOutputFilePath() {
        return outputFilePath;
    }

    public Optional<Date> getSinceDate() {
        return sinceDate;
    }

    public Optional<Date> getUntilDate() {
        return untilDate;
    }

    public List<String> getFormats() {
        return formats;
    }
}
