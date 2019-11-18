library(pavo)
library(rjson)

filePath <- commandArgs(trailingOnly = TRUE)[1]

spectra <- getspec(where = filePath, ext = 'Master.Transmission')

files = colnames(spectra)
files = files[files != "wl"]

errors <- vector(mode = "list")
warnings <- vector(mode = "list")

for (i in 1 : nrow(spectra)) {
    row <- spectra[i,]

    for (file in files) {
        full_name <- paste(file, '.Master.Transmission', sep = '')
        val = row[[file]]

        if (val <= 0 && val >= - 2) {
            warnings <- c(errors, list(
            file = full_name,
            wavelen = row$wl,
            value = val
            ))
        } else if (val < - 2) {
            errors <- c(errors, list(
            file = full_name,
            wavelen = row$wl,
            value = val
            ))
        }
    }
}

write(toJSON(list(warnings=warnings, errors=errors)), stderr())

objective_metrics <- summary(spectra)

cat(toJSON(objective_metrics))
