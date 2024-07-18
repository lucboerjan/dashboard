<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('spelmains', function (Blueprint $table) {
            $table->bigIncrements('spelID');
            $table->string('datum',10)->default('0000-00-00');
            $table->string('omschrijving',80)->default('');
            $table->integer('aantalSpelers');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spelmains');
    }
};
