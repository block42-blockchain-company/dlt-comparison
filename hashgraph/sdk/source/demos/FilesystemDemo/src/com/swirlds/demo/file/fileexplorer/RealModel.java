package com.swirlds.demo.file.fileexplorer;

import com.swirlds.fs.FCFileSystem;
import com.swirlds.fs.internal.Hash;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public class RealModel implements Model {
	FCFileSystem fs;

	public RealModel(FCFileSystem fs) {
		this.fs = fs;
	}

	public List<String> ls(String path) {
		List<String> list = fs.directoryList(path);
		return (list != null) ? list : new ArrayList<>(0);
	}

	public byte[] getHash(String path) {
		final Hash entityHash = fs.getHash(path);
		return (entityHash != null) ? entityHash.getValue() : null;
	}

	public boolean isDir(String path) {
		return fs.directoryExists(path);
	}

	public void mkdir(String path) {
		Instant now = Instant.now();
		fs.directoryCreate(path, now.getEpochSecond(), now.getNano(),
				now.plus(365, ChronoUnit.DAYS).getEpochSecond(), null);
	}

	public void cp(String srcpath, String destpath) {
	}

	public void rm(String path) {
	}

	public void exportRec(String entity, String physDest) {
		fs.fileExport(entity, physDest);
	}

	public void importRec(String phys, String dest) {
	}
}
