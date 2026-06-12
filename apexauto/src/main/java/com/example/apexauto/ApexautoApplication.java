package com.example.apexauto;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashSet;
import java.util.Set;

@SpringBootApplication
public class ApexautoApplication {

	public static void main(String[] args) {
		loadDotenvIntoSystemProperties();
		SpringApplication.run(ApexautoApplication.class, args);
	}

	private static void loadDotenvIntoSystemProperties() {
		for (String directory : dotenvSearchDirectories()) {
			Path dotenvPath = Path.of(directory, ".env");

			if (!Files.exists(dotenvPath)) {
				continue;
			}

			Dotenv dotenv = Dotenv.configure()
					.directory(directory)
					.filename(".env")
					.ignoreIfMalformed()
					.ignoreIfMissing()
					.load();

			applyIfMissing(dotenv, "SPRING_DATASOURCE_URL");
			applyIfMissing(dotenv, "SPRING_DATASOURCE_USERNAME");
			applyIfMissing(dotenv, "SPRING_DATASOURCE_PASSWORD");
			applyIfMissing(dotenv, "JWT_SECRET_KEY");
			applyIfMissing(dotenv, "JWT_EXPIRATION_TIME");
			break;
		}
	}

	private static Set<String> dotenvSearchDirectories() {
		Path workingDirectory = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
		Set<String> directories = new LinkedHashSet<>();

		directories.add(workingDirectory.toString());
		directories.add(workingDirectory.resolve("apexauto").normalize().toString());

		Path parent = workingDirectory.getParent();
		if (parent != null) {
			directories.add(parent.toString());
			directories.add(parent.resolve("apexauto").normalize().toString());
		}

		return directories;
	}

	private static void applyIfMissing(Dotenv dotenv, String key) {
		if (System.getenv(key) != null || System.getProperty(key) != null) {
			return;
		}

		String value = dotenv.get(key);
		if (value != null && !value.isBlank()) {
			System.setProperty(key, value);
		}
	}

}
